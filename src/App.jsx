import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppBar, Avatar, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, InputBase, Menu, MenuItem, Snackbar, Tooltip, Toolbar,
} from '@mui/material';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import ViewStreamOutlinedIcon from '@mui/icons-material/ViewStreamOutlined';

const STORAGE_KEY = 'keep-todo-items-v1';
const COLORS = [
  { name: 'Default', value: '#ffffff' },
  { name: 'Coral', value: '#fce8e6' },
  { name: 'Peach', value: '#fef0db' },
  { name: 'Sand', value: '#fff8d8' },
  { name: 'Sage', value: '#e6f4ea' },
  { name: 'Mint', value: '#e0f2f1' },
  { name: 'Sky', value: '#e8f0fe' },
  { name: 'Lavender', value: '#f3e8fd' },
];
const initialTodos = [
  { id: 'sample-1', title: 'Make space for the good stuff', text: 'A little progress each day adds up to big results.', color: '#fff8d8', done: false, pinned: true, archived: false, createdAt: 3 },
  { id: 'sample-2', title: 'Weekend reset', text: 'Pick up groceries\nWater the plants\nCall mom', color: '#e6f4ea', done: false, pinned: false, archived: false, createdAt: 2 },
  { id: 'sample-3', title: 'Read 10 pages', text: 'Make a cup of tea and enjoy a quiet moment.', color: '#f3e8fd', done: true, pinned: false, archived: false, createdAt: 1 },
];

function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return initialTodos;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.some((todo) => !todo || typeof todo.id !== 'string' || typeof todo.title !== 'string')) {
      throw new Error('Saved to-dos are not in the expected format.');
    }
    return parsed;
  } catch (error) {
    console.error('Unable to load saved to-dos from localStorage.', error);
    return initialTodos;
  }
}

const navItems = [
  { id: 'notes', label: 'Notes', icon: LightbulbOutlinedIcon },
  { id: 'completed', label: 'Completed', icon: CheckCircleOutlineOutlinedIcon },
  { id: 'archive', label: 'Archive', icon: ArchiveOutlinedIcon },
  { id: 'trash', label: 'Trash', icon: DeleteOutlineIcon },
];

export default function App() {
  const [todos, setTodos] = useState(loadTodos);
  const [activeView, setActiveView] = useState('notes');
  const [query, setQuery] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftText, setDraftText] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [menu, setMenu] = useState(null);
  const [editing, setEditing] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Unable to save to-dos to localStorage.', error);
      setSnackbar('Could not save changes in this browser.');
    }
  }, [todos]);

  const visibleTodos = useMemo(() => {
    const search = query.trim().toLowerCase();
    return todos
      .filter((todo) => {
        if (activeView === 'archive') return todo.archived;
        if (activeView === 'trash') return todo.trashed;
        if (todo.archived || todo.trashed) return false;
        if (activeView === 'completed') return todo.done;
        return !todo.done;
      })
      .filter((todo) => !search || `${todo.title} ${todo.text}`.toLowerCase().includes(search))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt);
  }, [todos, activeView, query]);

  const saveDraft = () => {
    const title = draftTitle.trim();
    const text = draftText.trim();
    if (!title && !text) {
      setComposerOpen(false);
      return;
    }
    setTodos((current) => [{
      id: crypto.randomUUID(),
      title: title || 'Untitled',
      text,
      color: '#ffffff',
      done: false,
      pinned: false,
      archived: false,
      createdAt: Date.now(),
    }, ...current]);
    setDraftTitle('');
    setDraftText('');
    setComposerOpen(false);
  };

  const patchTodo = (id, changes) => setTodos((current) => current.map((todo) => todo.id === id ? { ...todo, ...changes } : todo));
  const deleteTodo = (todo) => {
    if (todo.trashed) {
      setTodos((current) => current.filter((item) => item.id !== todo.id));
      setSnackbar('To-do permanently deleted');
    } else {
      patchTodo(todo.id, { trashed: true, archived: false });
      setSnackbar('Moved to Trash');
    }
    setMenu(null);
  };

  const changeView = (view) => {
    setActiveView(view);
    setMobileNavOpen(false);
  };

  return (
    <div className="app-shell">
      <AppBar position="sticky" elevation={0} className="topbar">
        <Toolbar className="topbar-inner">
          <IconButton className="menu-button" aria-label="Open navigation" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
            <MenuIcon />
          </IconButton>
          <div className="brand">
            <span className="brand-mark"><LightbulbOutlinedIcon /></span>
            <span>Todo App</span>
          </div>
          <div className="search-box">
            <SearchIcon />
            <InputBase value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your notes" inputProps={{ 'aria-label': 'Search your to-dos' }} />
            {query && <IconButton size="small" aria-label="Clear search" onClick={() => setQuery('')}><CloseIcon fontSize="small" /></IconButton>}
          </div>
          <div className="top-actions">
            <Tooltip title="Refresh"><IconButton aria-label="Refresh" onClick={() => setTodos(loadTodos())}><RefreshIcon /></IconButton></Tooltip>
            <Tooltip title="Switch view"><IconButton aria-label="Switch view"><ViewAgendaOutlinedIcon /></IconButton></Tooltip>
            <Avatar className="user-avatar">S</Avatar>
          </div>
        </Toolbar>
      </AppBar>

      <div className="main-layout">
        <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
          <nav aria-label="Main navigation">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`nav-item ${activeView === id ? 'nav-active' : ''}`} onClick={() => changeView(id)}>
                <Icon className="nav-icon" /><span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="sidebar-tip"><span className="tip-spark">✦</span><span>Your ideas, all in one place.</span></div>
            <span className="sidebar-version">Made for your everyday</span>
          </div>
        </aside>
        {mobileNavOpen && <button aria-label="Close navigation" className="sidebar-backdrop" onClick={() => setMobileNavOpen(false)} />}

        <main className="content">
          <div className="content-heading">
            <div>
              <p className="eyebrow">{activeView === 'notes' ? 'YOUR LITTLE CORNER' : 'A LITTLE ORGANIZED'}</p>
              <h1>{activeView === 'notes' ? 'Notes' : navItems.find((item) => item.id === activeView)?.label}</h1>
            </div>
            <span className="item-count">{visibleTodos.length} {visibleTodos.length === 1 ? 'note' : 'notes'}</span>
          </div>

          {activeView === 'notes' && (
            <section className={`composer ${composerOpen ? 'composer-expanded' : ''}`} aria-label="Create a note">
              <div className="composer-fields">
                <InputBase inputRef={titleRef} placeholder="Take a note..." value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} onFocus={() => setComposerOpen(true)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); setComposerOpen(true); } }} className="composer-title" inputProps={{ 'aria-label': 'Note title' }} />
                {composerOpen && <InputBase placeholder="Add a little detail..." value={draftText} onChange={(event) => setDraftText(event.target.value)} multiline minRows={1} maxRows={5} className="composer-body" inputProps={{ 'aria-label': 'Note details' }} />}
              </div>
              {!composerOpen ? (
                <div className="composer-shortcuts">
                  <Tooltip title="New checklist"><IconButton aria-label="New checklist"><CheckBoxOutlinedIcon /></IconButton></Tooltip>
                  <Tooltip title="New note"><IconButton aria-label="New note"><ViewStreamOutlinedIcon /></IconButton></Tooltip>
                  <span className="composer-hint">A thought worth keeping?</span>
                </div>
              ) : (
                <div className="composer-footer">
                  <span className="composer-hint">Just start typing — we'll keep it safe.</span>
                  <Button onClick={saveDraft} variant="text">Close</Button>
                </div>
              )}
            </section>
          )}

          {visibleTodos.some((todo) => todo.pinned) && activeView === 'notes' && <div className="section-label"><PushPinOutlinedIcon /> PINNED</div>}
          {visibleTodos.length > 0 ? (
            <div className="notes-grid">
              {visibleTodos.map((todo, index) => (
                <article
                  key={todo.id}
                  className={`note-card ${todo.done ? 'note-done' : ''} ${index === 0 && todo.pinned && activeView === 'notes' ? 'pinned-card' : ''}`}
                  style={{ backgroundColor: todo.color || '#fff' }}
                  onClick={() => setEditing(todo)}
                >
                  <div className="note-card-head">
                    <h2>{todo.title}</h2>
                    <Tooltip title={todo.pinned ? 'Unpin note' : 'Pin note'}>
                      <IconButton className={`pin-button ${todo.pinned ? 'pin-active' : ''}`} aria-label={todo.pinned ? 'Unpin note' : 'Pin note'} onClick={(event) => { event.stopPropagation(); patchTodo(todo.id, { pinned: !todo.pinned }); }}>
                        <PushPinOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                  {todo.text && <p className="note-text">{todo.text}</p>}
                  <button className="todo-check" onClick={(event) => { event.stopPropagation(); patchTodo(todo.id, { done: !todo.done }); }} aria-label={todo.done ? 'Mark as not done' : 'Mark as done'}>
                    <Checkbox checked={todo.done} size="small" onChange={() => {}} onClick={(event) => event.stopPropagation()} />
                    <span>{todo.done ? 'Completed' : 'Mark as done'}</span>
                  </button>
                  <div className="note-actions">
                    <Tooltip title="Change color">
                      <IconButton aria-label="Change note color" onClick={(event) => { event.stopPropagation(); setMenu({ type: 'color', id: todo.id, anchor: event.currentTarget }); }}><ColorLensOutlinedIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title={todo.archived ? 'Unarchive' : 'Archive'}>
                      <IconButton aria-label={todo.archived ? 'Unarchive note' : 'Archive note'} onClick={(event) => { event.stopPropagation(); patchTodo(todo.id, { archived: !todo.archived }); }}><ArchiveOutlinedIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="More">
                      <IconButton aria-label="More note actions" onClick={(event) => { event.stopPropagation(); setMenu({ type: 'more', id: todo.id, anchor: event.currentTarget }); }}><MoreVertIcon /></IconButton>
                    </Tooltip>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-art"><LightbulbOutlinedIcon /></div>
              <h2>{query ? 'Nothing found' : activeView === 'trash' ? 'Your trash is empty' : activeView === 'archive' ? 'Nothing in your archive' : activeView === 'completed' ? 'Nothing checked off yet' : 'Your mind is wonderfully clear'}</h2>
              <p>{query ? 'Try a different search.' : activeView === 'notes' ? 'Capture a thought above and make room for the next one.' : 'Everything you need will show up here.'}</p>
              {activeView === 'notes' && !query && <Button startIcon={<AddTaskOutlinedIcon />} onClick={() => { setComposerOpen(true); titleRef.current?.focus(); }}>Create a note</Button>}
            </div>
          )}

          {visibleTodos.some((todo) => todo.done) && activeView === 'notes' && <div className="completed-note">A little progress is still progress <span>✦</span></div>}
        </main>
      </div>

      <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)} onClick={(event) => event.stopPropagation()}>
        {menu?.type === 'color' ? COLORS.map((color) => (
          <MenuItem key={color.value} onClick={() => { patchTodo(menu.id, { color: color.value }); setMenu(null); }}>
            <span className="color-dot" style={{ backgroundColor: color.value }} />{color.name}
          </MenuItem>
        )) : menu?.type === 'more' ? [
          <MenuItem key="archive" onClick={() => { const todo = todos.find((item) => item.id === menu.id); patchTodo(menu.id, { archived: !todo.archived }); setMenu(null); }}>{todos.find((todo) => todo.id === menu.id)?.archived ? 'Unarchive' : 'Archive'}</MenuItem>,
          <MenuItem key="delete" onClick={() => { const todo = todos.find((item) => item.id === menu.id); if (todo) deleteTodo(todo); }}>Move to Trash</MenuItem>,
        ] : null}
      </Menu>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="sm" PaperProps={{ className: 'edit-dialog', style: { backgroundColor: editing?.color || '#fff' } }}>
        {editing && (
          <>
            <DialogTitle className="edit-title"><InputBase value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} placeholder="Title" inputProps={{ 'aria-label': 'Edit note title' }} /><IconButton aria-label="Pin note" onClick={() => setEditing({ ...editing, pinned: !editing.pinned })}><PushPinOutlinedIcon color={editing.pinned ? 'primary' : 'inherit'} /></IconButton></DialogTitle>
            <DialogContent><InputBase value={editing.text} onChange={(event) => setEditing({ ...editing, text: event.target.value })} placeholder="Add a little detail..." multiline minRows={4} fullWidth inputProps={{ 'aria-label': 'Edit note details' }} /></DialogContent>
            <DialogActions><Button onClick={() => { patchTodo(editing.id, editing); setEditing(null); }}>Close</Button></DialogActions>
          </>
        )}
      </Dialog>
      <Snackbar open={Boolean(snackbar)} autoHideDuration={2800} onClose={() => setSnackbar('')} message={snackbar} />
    </div>
  );
}
