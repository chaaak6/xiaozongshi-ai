import { SendButton as Send } from '@lobehub/editor/react';
import { Tooltip } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useCallback } from 'react';

import { usePermission } from '@/hooks/usePermission';

import { selectors, useChatInputStore } from '../store';

const SendButton = memo(() => {
  const sendMenu = useChatInputStore((s) => s.sendMenu);
  const shape = useChatInputStore((s) => s.sendButtonProps?.shape);
  const size = useChatInputStore((s) => s.sendButtonProps?.size);
  const { generating, disabled } = useChatInputStore(selectors.sendButtonProps, isEqual);
  const [send, handleStop] = useChatInputStore((s) => [s.handleSendButton, s.handleStop]);

  const { allowed: canCreate, reason } = usePermission('create_content');

  // Dev mode: always allow send by directly reading the editor content
  const devSend = useCallback(() => {
    const state = useChatInputStore.getState();
    const editor = state.editor;
    if (!editor) return;

    // Get markdown content from editor
    const content = state.getMarkdownContent();
    if (!content.trim()) return;

    // Call onSend directly — same as handleSendButton but skips disabled check
    state.onSend?.({
      clearContent: () => editor.cleanDocument(),
      editor,
      getEditorData: state.getJSONState,
      getMarkdownContent: state.getMarkdownContent,
    });
  }, []);

  const reallyCanCreate = __DEV__ || canCreate;

  const button = (
    <Send
      disabled={__DEV__ ? generating : (disabled || !canCreate)}
      generating={generating}
      menu={reallyCanCreate ? (sendMenu as any) : undefined}
      placement={'topRight'}
      shape={shape}
      size={size}
      trigger={['hover']}
      onClick={generating ? undefined : (__DEV__ && disabled ? devSend : reallyCanCreate ? () => send() : undefined)}
      onStop={() => handleStop()}
    />
  );

  return reallyCanCreate ? button : <Tooltip title={reason}>{button}</Tooltip>;
});

SendButton.displayName = 'SendButton';

export default SendButton;
