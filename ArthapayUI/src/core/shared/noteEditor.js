import React, { useCallback, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
const toolbarOptions = [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'align': [] }],
    ['blockquote'],
    ['link'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    ['clean']
];
const defaultModules = {
    toolbar: toolbarOptions,
}

const defaultFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'align', 'blockquote',
    'link', 'list', 'bullet', 'check', 'indent', 'clean'

]
const noteEditorErrorClass='note-editor-error-border'
function NoteEditor({ formats = defaultFormats, initialContent = '', modules = defaultModules, placeholder = "Write something here", disabled = false, onChange, hasError, editorRef = null }) {
    const [content, setContent] = useState('');
    useEffect(()=>{
        setContent(initialContent)
    },[initialContent])
    useEffect(() => {
        const toolbar = document.querySelector('#quill-note-editor .ql-toolbar');
        const container = document.querySelector('#quill-note-editor .ql-container');
        if (toolbar && container && hasError) {
            toolbar.classList.add(noteEditorErrorClass)
            container.classList.add(noteEditorErrorClass)
        } else {
            toolbar.classList.remove(noteEditorErrorClass);
            container.classList.remove(noteEditorErrorClass);
        }
    }, [hasError]);
    const onContentChange = useCallback((updatedContent, _, __, editor) => {
        setContent(updatedContent)
        onChange(updatedContent, editor.getLength()-1)
    },[setContent,setContent]);
    return <ReactQuill ref={editorRef} id='quill-note-editor' theme="snow" placeholder={placeholder} readOnly={disabled} value={content} onChange={onContentChange} modules={modules} formats={formats} />;
}

export default NoteEditor