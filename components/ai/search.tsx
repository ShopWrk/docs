'use client';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type SyntheticEvent,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { RefreshCw, Send, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import { DefaultChatTransport, type Tool, type UIMessage, type UIToolInvocation } from 'ai';
import { Markdown } from '../markdown';
import { ThinkingStatus } from './thinking-status';

export type ChatUIMessage = UIMessage<
  never,
  {
    client: {
      location: string;
    };
  }
>;

export type SearchTool = Tool<{ query: string; limit: number }>;

const Context = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  chat: UseChatHelpers<ChatUIMessage>;
} | null>(null);

function ShopWrkMark({ className }: { className?: string }) {
  return (
    <>
      <img src="/images/shopwrk-symbol-black.svg" alt="" className={cn('dark:hidden', className)} />
      <img
        src="/images/shopwrk-symbol-white.svg"
        alt=""
        className={cn('hidden dark:block', className)}
      />
    </>
  );
}

const SUGGESTIONS = [
  'How do I take a payment?',
  'How do I add a technician?',
  'How does ShopWrk Pay work?',
];

export function AISearchPanelHeader({ className, ...props }: ComponentProps<'div'>) {
  const { setOpen } = useAISearchContext();

  return (
    <div className={cn('sw-ai-header', className)} {...props}>
      <div className="sw-ai-brand">
        <ShopWrkMark className="sw-ai-mark" />
        <div>
          <p className="sw-ai-title">Ask AI</p>
          <p className="sw-ai-subtitle">Answers from the docs. Verify anything important.</p>
        </div>
      </div>

      <button
        aria-label="Close"
        tabIndex={-1}
        className="sw-ai-icon-btn"
        onClick={() => setOpen(false)}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function AISearchInputActions() {
  const { messages, status, setMessages, regenerate } = useChatContext();
  const isLoading = status === 'streaming';

  if (messages.length === 0) return null;

  return (
    <>
      {!isLoading && messages.at(-1)?.role === 'assistant' && (
        <button type="button" className="sw-ai-chip" onClick={() => regenerate()}>
          <RefreshCw className="size-3.5" />
          Retry
        </button>
      )}
      <button type="button" className="sw-ai-chip" onClick={() => setMessages([])}>
        Clear
      </button>
    </>
  );
}

const StorageKeyInput = '__ai_search_input';
export function AISearchInput(props: ComponentProps<'form'>) {
  const { status, sendMessage, stop } = useChatContext();
  const [input, setInput] = useState(() => localStorage.getItem(StorageKeyInput) ?? '');
  const isLoading = status === 'streaming' || status === 'submitted';
  const onStart = (e?: SyntheticEvent) => {
    e?.preventDefault();
    const message = input.trim();
    if (message.length === 0) return;

    void sendMessage({
      role: 'user',
      parts: [
        {
          type: 'data-client',
          data: {
            location: location.href,
          },
        },
        {
          type: 'text',
          text: message,
        },
      ],
    });
    setInput('');
    localStorage.removeItem(StorageKeyInput);
  };

  useEffect(() => {
    if (isLoading) document.getElementById('nd-ai-input')?.focus();
  }, [isLoading]);

  return (
    <form {...props} className={cn('flex items-start pe-2', props.className)} onSubmit={onStart}>
      <Input
        value={input}
        placeholder={isLoading ? 'ShopWrk is answering…' : 'Ask about ShopWrk'}
        autoFocus
        className="p-3"
        disabled={status === 'streaming' || status === 'submitted'}
        onChange={(e) => {
          setInput(e.target.value);
          localStorage.setItem(StorageKeyInput, e.target.value);
        }}
        onKeyDown={(event) => {
          // keyCode 229: Safari fires `compositionend` before this keydown, `isComposing` is already false
          if (event.nativeEvent.isComposing || event.keyCode === 229) return;
          if (!event.shiftKey && event.key === 'Enter') {
            onStart(event);
          }
        }}
      />
      {isLoading ? (
        <button key="bn" type="button" className="sw-ai-abort" onClick={stop}>
          Stop
        </button>
      ) : (
        <button key="bn" type="submit" className="sw-ai-send" disabled={input.length === 0}>
          <Send className="size-4" />
        </button>
      )}
    </form>
  );
}

function List(props: Omit<ComponentProps<'div'>, 'dir'>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    function callback() {
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'instant',
      });
    }

    const observer = new ResizeObserver(callback);
    callback();

    const element = containerRef.current?.firstElementChild;

    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn('fd-scroll-container overflow-y-auto min-w-0 flex flex-col', props.className)}
    >
      {props.children}
    </div>
  );
}

function Input(props: ComponentProps<'textarea'>) {
  const ref = useRef<HTMLDivElement>(null);
  const shared = cn('col-start-1 row-start-1', props.className);

  return (
    <div className="grid flex-1">
      <textarea
        id="nd-ai-input"
        {...props}
        className={cn(
          'resize-none bg-transparent placeholder:text-fd-muted-foreground focus-visible:outline-none',
          shared,
        )}
      />
      <div ref={ref} className={cn(shared, 'break-all invisible')}>
        {`${props.value?.toString() ?? ''}\n`}
      </div>
    </div>
  );
}

function messageHasText(message: ChatUIMessage) {
  return (message.parts ?? []).some((part) => part.type === 'text' && part.text.trim().length > 0);
}

function isSearchPending(call: UIToolInvocation<SearchTool>) {
  return call.state !== 'output-available' && call.state !== 'output-error' && call.state !== 'output-denied';
}

function Message({ message, ...props }: { message: ChatUIMessage } & ComponentProps<'div'>) {
  let markdown = '';
  const searchCalls: UIToolInvocation<SearchTool>[] = [];

  for (const part of message.parts ?? []) {
    if (part.type === 'text') {
      markdown += part.text;
      continue;
    }

    if (part.type.startsWith('tool-')) {
      const toolName = part.type.slice('tool-'.length);
      const p = part as UIToolInvocation<Tool>;

      if (toolName !== 'search' || !p.toolCallId) continue;
      searchCalls.push(p);
    }
  }

  if (message.role === 'user') {
    return (
      <div onClick={(e) => e.stopPropagation()} className="sw-ai-msg-user" {...props}>
        {markdown}
      </div>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()} className="sw-ai-msg-assistant" {...props}>
      {markdown.trim() ? (
        <>
          <p className="sw-ai-role">
            <ShopWrkMark className="sw-ai-role-mark" />
            ShopWrk
          </p>
          <div className="prose text-sm">
            <Markdown text={markdown} />
          </div>
        </>
      ) : null}

      {searchCalls.map((call) => {
        if (isSearchPending(call)) {
          return <ThinkingStatus key={call.toolCallId} state="searching" label="Searching docs" />;
        }

        return (
          <div key={call.toolCallId} className="sw-ai-search">
            {call.state === 'output-error' || call.state === 'output-denied' ? (
              <p className="text-fd-error">{call.errorText ?? 'Failed to search'}</p>
            ) : (
              <p>{`${call.output?.length ?? 0} matches in the docs`}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AISearch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const chat = useChat<ChatUIMessage>({
    id: 'search',
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  return (
    <Context value={useMemo(() => ({ chat, open, setOpen }), [chat, open])}>{children}</Context>
  );
}

export function AISearchTrigger({
  position = 'default',
  className,
  ...props
}: ComponentProps<'button'> & { position?: 'default' | 'float' }) {
  const { open, setOpen } = useAISearchContext();

  return (
    <button
      data-state={open ? 'open' : 'closed'}
      className={cn(
        position === 'float' && [
          'fixed bottom-4 inset-e-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))] z-20 transition-[translate,opacity]',
          open && 'translate-y-10 opacity-0',
        ],
        className,
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function AISearchPanel() {
  const { open, setOpen } = useAISearchContext();
  const [actualOpen, setActualOpen] = useState(open);
  useHotKey();

  if (open && !actualOpen) setActualOpen(open);

  return (
    <>
      <style>
        {`
        @keyframes ask-ai-open {
          from {
            translate: 100% 0;
          }
          to {
            translate: 0 0;
          }
        }
        @keyframes ask-ai-close {
          from {
            width: var(--ai-chat-width);
          }
          to {
            width: 0px;
          }
        }`}
      </style>
      {actualOpen && (
        <div
          className={cn(
            'fixed inset-0 z-30 backdrop-blur-xs bg-fd-overlay lg:hidden',
            open ? 'animate-fd-fade-in' : 'animate-fd-fade-out',
          )}
          onClick={() => setOpen(false)}
          onAnimationEnd={() => {
            if (!open) flushSync(() => setActualOpen(false));
          }}
        />
      )}
      {actualOpen && (
        <div
          className={cn(
            'sw-ai-panel overflow-hidden z-30 [--ai-chat-width:400px] 2xl:[--ai-chat-width:460px]',
            'max-lg:fixed max-lg:inset-x-2 max-lg:inset-y-4 max-lg:rounded-2xl max-lg:shadow-xl',
            'lg:sticky lg:top-0 lg:h-dvh lg:border-s lg:border-fd-border lg:in-[#nd-docs-layout]:[grid-area:toc] lg:in-[#nd-notebook-layout]:row-span-full lg:in-[#nd-notebook-layout]:col-start-5',
            open
              ? 'animate-fd-dialog-in lg:animate-[ask-ai-open_200ms]'
              : 'animate-fd-dialog-out lg:animate-[ask-ai-close_200ms]',
          )}
          onAnimationEnd={() => {
            if (!open) flushSync(() => setActualOpen(false));
          }}
        >
          <div className="sw-ai-frame">
            <AISearchPanelHeader />
            <AISearchPanelList className="flex-1" />
            <div className="sw-ai-composer">
              <AISearchInput />
              <div className="sw-ai-actions">
                <AISearchInputActions />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AISearchPanelList({ className, style, ...props }: ComponentProps<'div'>) {
  const chat = useChatContext();
  const messages = chat.messages.filter((msg) => msg.role !== 'system');
  const isBusy = chat.status === 'streaming' || chat.status === 'submitted';
  const last = messages.at(-1);
  const lastIsSearching =
    last?.role === 'assistant' &&
    (last.parts ?? []).some((part) => {
      if (!part.type.startsWith('tool-')) return false;
      const call = part as UIToolInvocation<Tool>;
      return isSearchPending(call as UIToolInvocation<SearchTool>);
    });
  const showComposingOrb =
    isBusy && !lastIsSearching && (last?.role !== 'assistant' || !messageHasText(last));

  return (
    <List
      className={cn('py-4 overscroll-contain', className)}
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)',
        ...style,
      }}
      {...props}
    >
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col px-3 gap-4">
          {chat.error && (
            <div className="sw-ai-error">
              <p className="sw-ai-subtitle">Request failed: {chat.error.name}</p>
              <p className="text-sm">{chat.error.message}</p>
            </div>
          )}
          {messages.map((item) => {
            if (
              item.role === 'assistant' &&
              isBusy &&
              !messageHasText(item) &&
              !(item.parts ?? []).some((part) => part.type.startsWith('tool-'))
            ) {
              return null;
            }
            return <Message key={item.id} message={item} />;
          })}
          {showComposingOrb ? <ThinkingStatus state="composing" label="ShopWrk is answering" /> : null}
        </div>
      )}
    </List>
  );
}

export function useHotKey() {
  const { open, setOpen } = useAISearchContext();

  const onKeyPress = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      e.preventDefault();
    }

    if (e.key === '/' && (e.metaKey || e.ctrlKey) && !open) {
      setOpen(true);
      e.preventDefault();
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, []);
}

export function useAISearchContext() {
  return use(Context)!;
}

function useChatContext() {
  return use(Context)!.chat;
}

function EmptyState() {
  const { sendMessage } = useChatContext();

  const ask = (message: string) => {
    void sendMessage({
      role: 'user',
      parts: [
        {
          type: 'data-client',
          data: {
            location: location.href,
          },
        },
        {
          type: 'text',
          text: message,
        },
      ],
    });
  };

  return (
    <div className="sw-ai-empty" onClick={(e) => e.stopPropagation()}>
      <ShopWrkMark className="sw-ai-empty-mark" />
      <p className="sw-ai-empty-title">Ask anything about ShopWrk</p>
      <p className="sw-ai-empty-copy">Payments, staff, jobs, and the rest of the docs.</p>
      <div className="sw-ai-suggestions">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="sw-ai-suggestion"
            onClick={() => ask(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
