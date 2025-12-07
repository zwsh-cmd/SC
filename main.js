// === ScriptMind: 編劇筆記本核心邏輯 ===
const { useState, useEffect, useCallback, useMemo, useRef } = React;
const { createRoot } = ReactDOM;

// === 1. Icon 組件 (SVG) ===
const IconBase = ({ d, className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
    </svg>
);

const Icons = {
    Book: (props) => <IconBase d={["M4 19.5A2.5 2.5 0 0 1 6.5 17H20", "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"]} {...props} />,
    Folder: (props) => <IconBase d={["M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"]} {...props} fill="currentColor" className={`${props.className} text-amber-200 stroke-amber-500`} />,
    FolderOpen: (props) => <IconBase d={["M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"]} {...props} fill="currentColor" className={`${props.className} text-amber-100 stroke-amber-400`} />,
    FileText: (props) => <IconBase d={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8", "M10 9H8"]} {...props} />,
    Plus: (props) => <IconBase d={["M12 5v14", "M5 12h14"]} {...props} />,
    Trash: (props) => <IconBase d={["M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"]} {...props} />,
    Edit: (props) => <IconBase d={["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"]} {...props} />,
    ChevronRight: (props) => <IconBase d="M9 18l6-6-6-6" {...props} />,
    ChevronDown: (props) => <IconBase d="M6 9l6 6 6-6" {...props} />,
    Heart: (props) => <IconBase d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" {...props} />,
    History: (props) => <IconBase d={["M3 3v5h5", "M3.05 13A9 9 0 1 0 6 5.3L3 8"]} {...props} />,
    Refresh: (props) => <IconBase d={["M23 4v6h-6", "M1 20v-6h6", "M3.51 9a9 9 0 0 1 14.85-3.36L23 10", "M1 14l4.64 4.36A9 9 0 0 1 20.49 15"]} {...props} />,
    Search: (props) => <IconBase d={["M11 11m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0", "M21 21l-4.35-4.35"]} {...props} />,
    Move: (props) => <IconBase d={["M5 9l-3 3 3 3", "M9 5l3-3 3 3", "M19 9l3 3-3 3", "M9 19l3 3 3 3", "M2 12h20", "M12 2v20"]} {...props} />,
    MessageCircle: (props) => <IconBase d={["M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"]} {...props} />,
    Info: (props) => <IconBase d={["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"]} {...props} />,
    Settings: (props) => <IconBase d={["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"]} {...props} />,
};

// === 2. 實用工具函數 ===
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatTime = (isoString) => {
    if (!isoString) return "尚無編輯";
    const d = new Date(isoString);
    return `${d.getFullYear()}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
};

// 簡單的 Markdown 解析器 (不依賴外部庫)
const SimpleMarkdown = ({ text }) => {
    if (!text) return null;
    let html = text
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") // Escape HTML
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
        .replace(/\*(.*?)\*/g, '<i>$1</i>') // Italic
        .replace(/^# (.*$)/gm, '<h1>$1</h1>') // H1
        .replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>') // List items (simple)
        .replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>') // Quote
        .replace(/\n/g, '<br />'); // Line breaks

    return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
};

// 初始範例資料
const INITIAL_DATA = {
    categories: [
        {
            id: 'root-1', name: '角色設計', children: [
                { id: 'c-1', name: '內在動力', children: [], notes: [] },
                { id: 'c-2', name: '人物弧光', children: [], notes: [] }
            ], notes: []
        },
        {
            id: 'root-2', name: '故事結構', children: [], notes: [
                {
                    id: 'n-1',
                    title: '救貓咪時刻',
                    desc: '這是在故事開頭，主角做的一件善事，讓觀眾喜歡上他。\n\n**重點**：必須是無私的。',
                    responses: [{ id: 'r-1', content: '我覺得反派也需要救貓咪，讓觀眾產生矛盾感。', updatedAt: new Date().toISOString() }],
                    updatedAt: new Date().toISOString()
                }
            ]
        }
    ]
};

// === 3. 核心組件 ===

// 3.1 筆記編輯器 Modal
const NoteEditor = ({ note, categoryName, onClose, onSave, allCategories, onDelete }) => {
    const [title, setTitle] = useState(note?.title || "");
    const [desc, setDesc] = useState(note?.desc || "");
    const [responses, setResponses] = useState(note?.responses || []);
    const [moveTargetId, setMoveTargetId] = useState("");
    const [activeTab, setActiveTab] = useState('edit'); // edit | preview

    // 扁平化分類供移動選擇
    const flattenCategories = (cats, depth = 0, result = []) => {
        cats.forEach(c => {
            result.push({ id: c.id, name: `${'- '.repeat(depth)}${c.name}` });
            flattenCategories(c.children, depth + 1, result);
        });
        return result;
    };
    const flatCats = useMemo(() => flattenCategories(allCategories), [allCategories]);

    const handleAddResponse = () => {
        setResponses([...responses, { id: generateId(), content: "", updatedAt: new Date().toISOString() }]);
    };

    const handleUpdateResponse = (id, content) => {
        setResponses(prev => prev.map(r => r.id === id ? { ...r, content, updatedAt: new Date().toISOString() } : r));
    };

    const handleDeleteResponse = (id) => {
        setResponses(prev => prev.filter(r => r.id !== id));
    };

    const handleSave = () => {
        if (!title.trim()) return alert("標題不能為空");
        onSave({
            ...note,
            id: note?.id || generateId(),
            title,
            desc,
            responses,
            updatedAt: new Date().toISOString()
        }, moveTargetId);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-stone-50">
                    <div>
                        <h2 className="text-xl font-bold text-stone-800">{note ? "編輯筆記" : "新增筆記"}</h2>
                        <span className="text-xs text-stone-500 flex items-center gap-1">
                            <Icons.Folder className="w-3 h-3" /> {categoryName}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full"><Icons.Plus className="w-6 h-6 rotate-45 text-stone-500" /></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
                    {/* Title */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-stone-600 mb-2">大標題 (限50字)</label>
                        <input 
                            value={title} 
                            onChange={e => e.target.value.length <= 50 && setTitle(e.target.value)}
                            className="w-full text-2xl font-bold border-b-2 border-stone-200 focus:border-stone-500 outline-none py-2 bg-transparent placeholder-stone-300"
                            placeholder="輸入標題..."
                        />
                        <div className="text-right text-xs text-stone-400 mt-1">{title.length}/50</div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-sm font-bold text-stone-600">說明 (限500字, 支援 Markdown)</label>
                            <div className="flex gap-2 bg-stone-100 p-1 rounded-lg">
                                <button onClick={() => setActiveTab('edit')} className={`px-3 py-1 text-xs rounded-md transition-all ${activeTab === 'edit' ? 'bg-white shadow text-stone-800' : 'text-stone-500'}`}>編輯</button>
                                <button onClick={() => setActiveTab('preview')} className={`px-3 py-1 text-xs rounded-md transition-all ${activeTab === 'preview' ? 'bg-white shadow text-stone-800' : 'text-stone-500'}`}>預覽</button>
                            </div>
                        </div>
                        
                        {activeTab === 'edit' ? (
                            <textarea 
                                value={desc}
                                onChange={e => e.target.value.length <= 500 && setDesc(e.target.value)}
                                className="w-full h-40 p-4 bg-stone-50 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-300 outline-none resize-none text-stone-700"
                                placeholder="# 支援 Markdown 語法..."
                            />
                        ) : (
                            <div className="w-full h-40 p-4 bg-white border border-stone-100 rounded-xl overflow-y-auto custom-scrollbar">
                                <SimpleMarkdown text={desc || "無內容"} />
                            </div>
                        )}
                        <div className="text-right text-xs text-stone-400 mt-1">{desc.length}/500</div>
                    </div>

                    {/* Responses */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Icons.MessageCircle className="w-5 h-5 text-stone-600" />
                            <h3 className="font-bold text-stone-700">心得回應</h3>
                        </div>
                        <div className="space-y-4">
                            {responses.map((resp, idx) => (
                                <div key={resp.id} className="bg-stone-50 p-4 rounded-xl border border-stone-100 group relative hover:shadow-md transition-shadow">
                                    <div className="flex justify-between text-xs text-stone-400 mb-2">
                                        <span>回應 #{idx + 1}</span>
                                        <span>{formatTime(resp.updatedAt)}</span>
                                    </div>
                                    <textarea
                                        value={resp.content}
                                        onChange={e => e.target.value.length <= 500 && handleUpdateResponse(resp.id, e.target.value)}
                                        className="w-full bg-transparent outline-none resize-none text-stone-600 text-sm h-20"
                                        placeholder="寫下你的想法..."
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                         <div className="text-xs text-stone-300">{resp.content.length}/500</div>
                                         <button onClick={() => handleDeleteResponse(resp.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Icons.Trash className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={handleAddResponse} className="w-full py-3 border-2 border-dashed border-stone-200 text-stone-400 rounded-xl hover:border-stone-400 hover:text-stone-600 transition-colors flex items-center justify-center gap-2 font-medium">
                                <Icons.Plus className="w-5 h-5" /> 新增回應
                            </button>
                        </div>
                    </div>

                    {/* Move & Meta */}
                    <div className="border-t border-stone-100 pt-6 mt-6">
                        <label className="block text-sm font-bold text-stone-600 mb-2">移動到其他分類 (選填)</label>
                        <div className="flex gap-4">
                            <select 
                                value={moveTargetId} 
                                onChange={e => setMoveTargetId(e.target.value)}
                                className="flex-1 p-2 bg-white border border-stone-300 rounded-lg outline-none text-stone-700"
                            >
                                <option value="">維持目前位置</option>
                                {flatCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <p className="text-xs text-stone-400 mt-4 text-right">最後編輯: {formatTime(note?.updatedAt)}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-stone-50 flex justify-between">
                    {note && (
                        <button onClick={() => { if(confirm("確定刪除此筆記？")) { onDelete(note.id); onClose(); } }} className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2 font-medium transition-colors">
                            <Icons.Trash className="w-4 h-4" /> 刪除
                        </button>
                    )}
                    <div className="flex gap-3 ml-auto">
                        <button onClick={onClose} className="px-6 py-2 text-stone-500 hover:text-stone-800 font-medium">取消</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-stone-800 text-white rounded-lg shadow hover:bg-stone-900 transition-transform active:scale-95 font-bold flex items-center gap-2">
                            <Icons.Book className="w-4 h-4" /> 儲存筆記
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3.2 樹狀分類節點
const TreeNode = ({ node, level = 0, onAddSub, onAddNote, onEditNote, onDeleteCategory, parentId, onToggle, expandedIds }) => {
    const isExpanded = expandedIds.includes(node.id);
    const hasChildren = node.children.length > 0 || node.notes.length > 0;

    return (
        <div className="select-none">
            <div 
                className={`flex items-center gap-2 p-2 rounded-lg hover:bg-stone-100 transition-colors group cursor-pointer ${level === 0 ? 'mb-2' : ''}`}
                style={{ marginLeft: `${level * 16}px` }}
                onClick={() => onToggle(node.id)}
            >
                <div className="text-stone-400 w-5 h-5 flex items-center justify-center shrink-0">
                    {hasChildren ? (
                         isExpanded ? <Icons.ChevronDown className="w-4 h-4" /> : <Icons.ChevronRight className="w-4 h-4" />
                    ) : <div className="w-4 h-4" />}
                </div>
                
                {isExpanded ? <Icons.FolderOpen className="w-5 h-5 shrink-0" /> : <Icons.Folder className="w-5 h-5 shrink-0" />}
                
                <span className="font-medium text-stone-700 truncate flex-1">{node.name}</span>
                
                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onAddSub(node.id); }} title="新增子分類" className="p-1 hover:bg-stone-200 rounded text-stone-500"><Icons.Folder className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onAddNote(node.id); }} title="新增筆記" className="p-1 hover:bg-stone-200 rounded text-stone-500"><Icons.FileText className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); if(confirm(`確定刪除分類「${node.name}」及其內容？`)) onDeleteCategory(node.id, parentId); }} title="刪除分類" className="p-1 hover:bg-red-100 rounded text-red-400"><Icons.Trash className="w-3 h-3" /></button>
                </div>
            </div>

            {isExpanded && (
                <div className="relative">
                    {level > 0 && <div className="tree-line" style={{ left: `${(level * 16) + 11}px` }}></div>}
                    {node.children.map(child => (
                        <TreeNode 
                            key={child.id} 
                            node={child} 
                            level={level + 1} 
                            parentId={node.id}
                            onAddSub={onAddSub} 
                            onAddNote={onAddNote} 
                            onEditNote={onEditNote}
                            onDeleteCategory={onDeleteCategory}
                            onToggle={onToggle}
                            expandedIds={expandedIds}
                        />
                    ))}
                    {node.notes.map(note => (
                        <div 
                            key={note.id} 
                            onClick={() => onEditNote(note, node.name, node.id)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-stone-100 transition-all cursor-pointer group ml-[20px]"
                            style={{ marginLeft: `${(level + 1) * 16}px` }}
                        >
                            <Icons.FileText className="w-4 h-4 text-stone-400 shrink-0" />
                            <span className="text-sm text-stone-600 truncate">{note.title}</span>
                            <span className="ml-auto text-[10px] text-stone-300 group-hover:text-stone-400">{formatTime(note.updatedAt).split(' ')[0]}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// 3.3 隨機推播卡片
const InspirationCard = ({ note, onNext, onFavorite, isFavorite, onEdit }) => {
    if (!note) return (
        <div className="flex flex-col items-center justify-center h-64 text-stone-400">
            <Icons.Book className="w-12 h-12 mb-4 opacity-50" />
            <p>目前還沒有任何筆記。</p>
            <p className="text-sm">前往「知識庫」新增第一條筆記吧！</p>
        </div>
    );

    return (
        <div className="w-full max-w-lg mx-auto perspective">
            <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden relative group transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">每日靈感</span>
                        <div className="flex gap-2">
                            <button onClick={onFavorite} className={`p-2 rounded-full transition-colors ${isFavorite ? 'bg-red-50 text-red-500' : 'hover:bg-stone-100 text-stone-400'}`}>
                                <Icons.Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                            <button onClick={onEdit} className="p-2 hover:bg-stone-100 text-stone-400 rounded-full">
                                <Icons.Edit className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    
                    <h2 className="text-3xl font-black text-stone-800 mb-6 leading-tight text-center text-balance">{note.title}</h2>
                    
                    <div className="bg-stone-50 p-4 rounded-xl mb-6 text-stone-600 text-sm leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                         <SimpleMarkdown text={note.desc} />
                    </div>

                    <div className="text-center">
                        <button onClick={onNext} className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-full font-bold shadow-lg hover:bg-stone-700 active:scale-95 transition-all">
                            <Icons.Refresh className="w-4 h-4" /> 下一個靈感
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// === 4. 主程式 App ===
const App = () => {
    // State: Data
    const [data, setData] = useState(INITIAL_DATA);
    const [favorites, setFavorites] = useState([]); // Array of IDs
    const [history, setHistory] = useState([]); // Array of Objects {note, timestamp}
    const [seenLog, setSeenLog] = useState([]); // Array of IDs for random logic

    // State: UI
    const [view, setView] = useState('home'); // home, tree, favorites, history
    const [expandedIds, setExpandedIds] = useState([]);
    const [editingNoteData, setEditingNoteData] = useState(null); // { note, categoryName, categoryId }
    const [dailyNote, setDailyNote] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    // --- Data Persistence ---
    useEffect(() => {
        const load = (key, setter, defaultVal) => {
            const saved = localStorage.getItem(`scriptmind_${key}`);
            if (saved) setter(JSON.parse(saved));
            else if (defaultVal) setter(defaultVal);
        };
        load('data', setData, INITIAL_DATA);
        load('favorites', setFavorites, []);
        load('history', setHistory, []);
        load('seenLog', setSeenLog, []);
    }, []);

    useEffect(() => { localStorage.setItem('scriptmind_data', JSON.stringify(data)); }, [data]);
    useEffect(() => { localStorage.setItem('scriptmind_favorites', JSON.stringify(favorites)); }, [favorites]);
    useEffect(() => { localStorage.setItem('scriptmind_history', JSON.stringify(history)); }, [history]);
    useEffect(() => { localStorage.setItem('scriptmind_seenLog', JSON.stringify(seenLog)); }, [seenLog]);

    // --- Helpers to flatten/find notes ---
    const getAllNotes = useCallback(() => {
        const notes = [];
        const traverse = (cats) => {
            cats.forEach(c => {
                c.notes.forEach(n => notes.push({ ...n, categoryId: c.id, categoryName: c.name }));
                traverse(c.children);
            });
        };
        traverse(data.categories);
        return notes;
    }, [data]);

    const findCategory = (cats, id) => {
        for (let c of cats) {
            if (c.id === id) return c;
            const found = findCategory(c.children, id);
            if (found) return found;
        }
        return null;
    };

    // --- Logic: Random Picker ---
    const pickRandomNote = useCallback(() => {
        const allNotes = getAllNotes();
        if (allNotes.length === 0) return null;

        let available = allNotes.filter(n => !seenLog.includes(n.id));
        
        // Reset logic: if all seen (or almost all), clear log but keep last 50 to avoid immediate repeat
        if (available.length === 0) {
            const keep = seenLog.slice(-50); 
            setSeenLog(keep);
            available = allNotes.filter(n => !keep.includes(n.id));
            if (available.length === 0) available = allNotes; // Fallback
        }

        const randomIndex = Math.floor(Math.random() * available.length);
        const picked = available[randomIndex];

        // Update States
        setSeenLog(prev => {
            const next = [...prev, picked.id];
            // Ensure unique 100 logic (keep tracking up to 100+)
            return next.length > 200 ? next.slice(-100) : next; 
        });

        setHistory(prev => [{ note: picked, timestamp: new Date().toISOString() }, ...prev].slice(0, 50));
        setDailyNote(picked);
    }, [getAllNotes, seenLog]);

    // Init Random Note on Load
    useEffect(() => {
        if (!dailyNote && getAllNotes().length > 0) {
            pickRandomNote();
        }
    }, [data]); // Depend on data load

    // --- Handlers: Tree Actions ---
    const toggleExpand = (id) => {
        setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const addSubCategory = (parentId) => {
        const name = prompt("請輸入子分類名稱：");
        if (!name) return;
        const newCat = { id: generateId(), name, children: [], notes: [] };
        
        const updateTree = (cats) => cats.map(c => {
            if (c.id === parentId) return { ...c, children: [...c.children, newCat] };
            return { ...c, children: updateTree(c.children) };
        });

        setData(prev => ({ ...prev, categories: updateTree(prev.categories) }));
        setExpandedIds(prev => [...prev, parentId]);
    };

    const addRootCategory = () => {
        const name = prompt("請輸入主分類名稱：");
        if (!name) return;
        setData(prev => ({ ...prev, categories: [...prev.categories, { id: generateId(), name, children: [], notes: [] }] }));
    };

    const deleteCategory = (id, parentId) => {
        if (!parentId) {
            setData(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }));
        } else {
            const updateTree = (cats) => cats.map(c => {
                if (c.id === parentId) return { ...c, children: c.children.filter(child => child.id !== id) };
                return { ...c, children: updateTree(c.children) };
            });
            setData(prev => ({ ...prev, categories: updateTree(prev.categories) }));
        }
    };

    // --- Handlers: Note Actions ---
    const openNoteEditor = (note = null, categoryName = "", categoryId = "") => {
        setEditingNoteData({ note, categoryName, categoryId });
    };

    const saveNote = (noteObj, newCategoryId) => {
        const targetCatId = newCategoryId || editingNoteData.categoryId;
        
        // Remove from old location if moving (or updating)
        const removeFromTree = (cats) => cats.map(c => ({
            ...c,
            children: removeFromTree(c.children),
            notes: c.notes.filter(n => n.id !== noteObj.id)
        }));
        
        // Add to new/current location
        const addToTree = (cats) => cats.map(c => {
            if (c.id === targetCatId) return { ...c, notes: [...c.notes, noteObj] };
            return { ...c, children: addToTree(c.children) };
        });

        // Atomic update
        let newCats = data.categories;
        if (editingNoteData.note) { // If editing existing, remove first
             newCats = removeFromTree(newCats);
        }
        newCats = addToTree(newCats);
        
        setData({ ...data, categories: newCats });
        
        // Update daily note view if we just edited it
        if (dailyNote && dailyNote.id === noteObj.id) {
            setDailyNote({ ...noteObj, categoryId: targetCatId, categoryName: findCategory(newCats, targetCatId)?.name });
        }
    };

    const deleteNote = (noteId) => {
        const updateTree = (cats) => cats.map(c => ({
            ...c,
            children: updateTree(c.children),
            notes: c.notes.filter(n => n.id !== noteId)
        }));
        setData({ ...data, categories: updateTree(data.categories) });
        if (dailyNote?.id === noteId) pickRandomNote();
    };

    // --- Handlers: Favorites ---
    const toggleFavorite = (noteId) => {
        setFavorites(prev => prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]);
    };

    // --- Backup ---
    const handleBackup = () => {
        const blob = new Blob([JSON.stringify({ data, favorites, history, seenLog })], { type: "application/json" });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `ScriptMind_Backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
    };

    // --- Main Render ---
    return (
        <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-2xl overflow-hidden sm:border-x sm:border-gray-200">
            {/* Navbar */}
            <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                    <h1 className="text-xl font-bold tracking-tight text-stone-800">ScriptMind</h1>
                </div>
                <button onClick={() => setShowSettings(!showSettings)} className="text-stone-400 hover:text-stone-600"><Icons.Settings className="w-6 h-6" /></button>
            </div>

            {/* Settings Dropdown */}
            {showSettings && (
                <div className="bg-stone-50 border-b border-gray-100 p-4 animate-in slide-in-from-top-2">
                    <button onClick={handleBackup} className="w-full py-2 bg-white border border-stone-200 rounded-lg text-stone-600 font-medium hover:bg-stone-100">下載資料備份</button>
                    <p className="text-xs text-center text-stone-400 mt-2">v1.0.0 • LocalStorage Only</p>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {/* View: Home (Daily) */}
                {view === 'home' && (
                    <div className="h-full overflow-y-auto custom-scrollbar p-6 flex flex-col items-center justify-center bg-stone-50/50">
                        <InspirationCard 
                            note={dailyNote} 
                            onNext={pickRandomNote} 
                            isFavorite={dailyNote && favorites.includes(dailyNote.id)}
                            onFavorite={() => dailyNote && toggleFavorite(dailyNote.id)}
                            onEdit={() => dailyNote && openNoteEditor(dailyNote, dailyNote.categoryName, dailyNote.categoryId)}
                        />
                    </div>
                )}

                {/* View: Tree */}
                {view === 'tree' && (
                    <div className="h-full overflow-y-auto custom-scrollbar p-4 pb-24">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h2 className="text-lg font-bold text-stone-700">編劇知識庫</h2>
                            <button onClick={addRootCategory} className="text-sm bg-stone-800 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-stone-700 shadow flex items-center gap-1">
                                <Icons.Plus className="w-4 h-4" /> 新增分類
                            </button>
                        </div>
                        {data.categories.length === 0 ? (
                            <div className="text-center py-10 text-stone-400">尚無分類，請點擊右上方新增</div>
                        ) : (
                            data.categories.map(root => (
                                <TreeNode 
                                    key={root.id} 
                                    node={root} 
                                    onAddSub={addSubCategory}
                                    onAddNote={(catId) => openNoteEditor(null, root.name, catId)} // Name might be imprecise for deep nested, but functional
                                    onEditNote={(n, cName, cId) => openNoteEditor(n, cName, cId)}
                                    onDeleteCategory={deleteCategory}
                                    onToggle={toggleExpand}
                                    expandedIds={expandedIds}
                                />
                            ))
                        )}
                    </div>
                )}

                {/* View: Favorites */}
                {view === 'favorites' && (
                    <div className="h-full overflow-y-auto custom-scrollbar p-4">
                        <h2 className="text-lg font-bold text-stone-700 mb-4 px-2 flex items-center gap-2">
                            <Icons.Heart className="w-5 h-5 fill-red-500 text-red-500" /> 我的收藏 ({favorites.length})
                        </h2>
                        {favorites.length === 0 ? <p className="text-center text-stone-400 mt-10">還沒有收藏任何靈感。</p> : (
                            <div className="space-y-3">
                                {getAllNotes().filter(n => favorites.includes(n.id)).map(n => (
                                    <div key={n.id} onClick={() => openNoteEditor(n, n.categoryName, n.categoryId)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
                                        <h3 className="font-bold text-stone-800 mb-1">{n.title}</h3>
                                        <div className="text-xs text-stone-400 flex justify-between">
                                            <span>{n.categoryName}</span>
                                            <span>{formatTime(n.updatedAt)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* View: History */}
                {view === 'history' && (
                    <div className="h-full overflow-y-auto custom-scrollbar p-4">
                        <h2 className="text-lg font-bold text-stone-700 mb-4 px-2 flex items-center gap-2">
                            <Icons.History className="w-5 h-5" /> 最近推播 ({history.length})
                        </h2>
                        <div className="space-y-3">
                            {history.map((h, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group">
                                    <div className="flex-1 cursor-pointer" onClick={() => openNoteEditor(h.note, h.note.categoryName, h.note.categoryId)}>
                                        <h3 className="font-bold text-stone-800 mb-1">{h.note.title}</h3>
                                        <p className="text-xs text-stone-400">瀏覽於: {formatTime(h.timestamp)}</p>
                                    </div>
                                    {!favorites.includes(h.note.id) && (
                                        <button onClick={() => toggleFavorite(h.note.id)} className="p-2 text-stone-300 hover:text-red-500">
                                            <Icons.Heart className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white border-t border-gray-100 p-2 flex justify-around items-center text-xs font-medium text-stone-400">
                <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${view === 'home' ? 'text-stone-800 bg-stone-100' : 'hover:bg-stone-50'}`}>
                    <Icons.Book className="w-6 h-6" /> 靈感
                </button>
                <button onClick={() => setView('tree')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${view === 'tree' ? 'text-stone-800 bg-stone-100' : 'hover:bg-stone-50'}`}>
                    <Icons.Folder className="w-6 h-6" /> 知識庫
                </button>
                <button onClick={() => setView('favorites')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${view === 'favorites' ? 'text-stone-800 bg-stone-100' : 'hover:bg-stone-50'}`}>
                    <Icons.Heart className="w-6 h-6" /> 收藏
                </button>
                <button onClick={() => setView('history')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${view === 'history' ? 'text-stone-800 bg-stone-100' : 'hover:bg-stone-50'}`}>
                    <Icons.History className="w-6 h-6" /> 歷史
                </button>
            </div>

            {/* Modal Layer */}
            {editingNoteData && (
                <NoteEditor 
                    note={editingNoteData.note} 
                    categoryName={editingNoteData.categoryName}
                    allCategories={data.categories}
                    onClose={() => setEditingNoteData(null)}
                    onSave={saveNote}
                    onDelete={deleteNote}
                />
            )}
        </div>
    );
};

// Start
const root = createRoot(document.getElementById('root'));
root.render(<App />);