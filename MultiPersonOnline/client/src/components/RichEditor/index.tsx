import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  CodeOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  BlockOutlined,
  PictureOutlined,
  TableOutlined,
  UndoOutlined,
  RedoOutlined,
} from '@ant-design/icons'
import { Button, Space, Divider, Tooltip } from 'antd'
import { useEffect } from 'react'

interface RichEditorProps {
  content: string
  placeholder?: string
  onChange?: (content: string) => void
  editable?: boolean
}

export default function RichEditor({
  content,
  placeholder = '请输入内容...',
  onChange,
  editable = true,
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const toolbarButtons = [
    {
      group: [
        { icon: <BoldOutlined />, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: '加粗' },
        { icon: <ItalicOutlined />, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: '斜体' },
        { icon: <UnderlineOutlined />, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline'), title: '下划线' },
        { icon: <StrikethroughOutlined />, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), title: '删除线' },
        { icon: <CodeOutlined />, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code'), title: '行内代码' },
      ],
    },
    {
      group: [
        { icon: <OrderedListOutlined />, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: '有序列表' },
        { icon: <UnorderedListOutlined />, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: '无序列表' },
        { icon: <BlockOutlined />, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock'), title: '代码块' },
      ],
    },
    {
      group: [
        { icon: <PictureOutlined />, action: () => {
          const url = window.prompt('请输入图片URL')
          if (url) editor.chain().focus().setImage({ src: url }).run()
        }, active: false, title: '插入图片' },
        { icon: <TableOutlined />, action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), active: false, title: '插入表格' },
      ],
    },
    {
      group: [
        { icon: <UndoOutlined />, action: () => editor.chain().focus().undo().run(), active: false, title: '撤销' },
        { icon: <RedoOutlined />, action: () => editor.chain().focus().redo().run(), active: false, title: '重做' },
      ],
    },
  ]

  return (
    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
        <Space size={4} wrap>
          {toolbarButtons.map((group, groupIndex) => (
            <Space key={groupIndex} size={4}>
              {group.group.map((btn, btnIndex) => (
                <Tooltip key={btnIndex} title={btn.title}>
                  <Button
                    type={btn.active ? 'primary' : 'text'}
                    size="small"
                    icon={btn.icon}
                    onClick={btn.action}
                  />
                </Tooltip>
              ))}
              {groupIndex < toolbarButtons.length - 1 && <Divider type="vertical" />}
            </Space>
          ))}
        </Space>
      </div>
      <EditorContent
        editor={editor}
        style={{
          minHeight: 400,
          padding: 20,
          outline: 'none',
        }}
      />
    </div>
  )
}
