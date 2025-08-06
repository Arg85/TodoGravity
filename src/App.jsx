import React, { useState, useEffect } from 'react';
import './App.css';
 
// AddTodo Component
const AddTodo = ({ onAddTodo, isLoading }) => {
  const [text, setText] = useState('');
 
  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onAddTodo(text.trim());
      setText('');
    }
  };
 
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
 
  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !text.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Adding...' : 'Add Task'}
        </button>
      </div>
    </div>
  );
};
 
// Filter Component
const Filter = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' }
  ];
 
  return (
    <div className="flex gap-2 mb-6">
      {filters.map(filter => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentFilter === filter.key
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};
 
// TodoItem Component
const TodoItem = ({ todo, onToggleComplete, onDeleteTodo, isUpdating, isDeleting }) => {
const isLoading = isUpdating === todo.id || isDeleting === todo.id;
  
  return (
    <div className={`flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm transition-opacity ${
      isLoading ? 'opacity-50' : ''
    }`}>
      <button
      style={{justifyContent:"center",alignItems:"center",display:"flex"}}
onClick={() => onToggleComplete(todo.id)}
        disabled={isLoading}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors disabled:cursor-not-allowed ${
          todo.completed
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {todo.completed && (
"✔️"        )}
      </button>
      
      <span
        className={`flex-1 cursor-pointer transition-colors ${
          todo.completed
            ? 'text-gray-500 line-through'
            : 'text-gray-800'
        } ${isLoading ? 'cursor-not-allowed' : ''}`}
onClick={() => !isLoading && onToggleComplete(todo.id)}
      >
        {todo.todo}
      </span>
      
      <button
onClick={() => onDeleteTodo(todo.id)}
        disabled={isLoading}
        className="flex-shrink-0 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:cursor-not-allowed disabled:text-gray-400"
      >
{isDeleting === todo.id ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
};
 
// TodoList Component
const TodoList = ({ todos, onToggleComplete, onDeleteTodo, isUpdating, isDeleting }) => {
  if (todos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks found. Add a new task to get started!
      </div>
    );
  }
 
  return (
    <div className="space-y-2">
      {todos.map(todo => (
        <TodoItem
key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onDeleteTodo={onDeleteTodo}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};
 
// API functions
const API_BASE = 'https://dummyjson.com';
 
const todoAPI = {
  getAllTodos: async (limit = 30) => {
    const response = await fetch(`${API_BASE}/todos?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch todos');
    return response.json();
  },
 
  addTodo: async (todoText) => {
    const response = await fetch(`${API_BASE}/todos/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        todo: todoText,
        completed: false,
        userId: 1,
      })
    });
    if (!response.ok) throw new Error('Failed to add todo');
    return response.json();
  },
 
  updateTodo: async (id, updates) => {
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update todo');
    return response.json();
  },
 
  deleteTodo: async (id) => {
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete todo');
    return response.json();
  }
};


function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
 
  // Load todos from API and localStorage on component mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, try to load from localStorage for immediate UI
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
          try {
            const localTodos = JSON.parse(savedTodos);
            setTodos(localTodos);
          } catch (e) {
            console.error('Error parsing saved todos:', e);
          }
        }
 
        // Then fetch from API to get fresh data
        const response = await todoAPI.getAllTodos(50);
        if (response.todos) {
          setTodos(response.todos);
          localStorage.setItem('todos', JSON.stringify(response.todos));
        }
      } catch (err) {
        console.error('Error loading todos:', err);
        setError('Failed to load todos. Using offline data if available.');
        
        // If API fails, try to use localStorage data
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
          try {
            const localTodos = JSON.parse(savedTodos);
            setTodos(localTodos);
          } catch (e) {
            console.error('Error parsing saved todos:', e);
          }
        }
      } finally {
        setLoading(false);
      }
    };
 
    loadTodos();
  }, []);
 
  // Save todos to localStorage whenever todos change
  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos]);
 
  // Add a new todo
  const addTodo = async (text) => {
    try {
      setIsAdding(true);
      setError(null);
 
      // Optimistically add to UI
      var tempTodo = {
        id: Date.now(),
        todo: text,
        completed: false,
        userId: 1
      };
      setTodos(prevTodos => [tempTodo, ...prevTodos]);
 
      // Try to add via API
      try {
        const newTodo = await todoAPI.addTodo(text);
        // Replace temp todo with API response
        setTodos(prevTodos =>
          prevTodos.map(todo =>
todo.id === tempTodo.id ? { ...newTodo, id: tempTodo.id } : todo
          )
        );
      } catch (apiError) {
        console.error('API add failed, keeping local todo:', apiError);
        // Keep the optimistic update if API fails
      }
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo');
      // Remove the optimistic update
setTodos(prevTodos => prevTodos.filter(todo => todo.id !== tempTodo.id));
    } finally {
      setIsAdding(false);
    }
  };
 
  // Toggle todo completion status
  const toggleComplete = async (id) => {
    try {
      setIsUpdating(id);
      setError(null);
 
      // Optimistically update UI
const todoToUpdate = todos.find(todo => todo.id === id);
      if (!todoToUpdate) return;
 
      setTodos(prevTodos =>
        prevTodos.map(todo =>
todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
 
      // Try to update via API
      try {
        await todoAPI.updateTodo(id, { completed: !todoToUpdate.completed });
      } catch (apiError) {
        console.error('API update failed, keeping local change:', apiError);
        // Keep the optimistic update if API fails
      }
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo');
      // Revert the optimistic update
      setTodos(prevTodos =>
        prevTodos.map(todo =>
todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    } finally {
      setIsUpdating(null);
    }
  };
 
  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      setIsDeleting(id);
      setError(null);
 
      // Store the todo for potential restoration
var todoToDelete = todos.find(todo => todo.id === id);
      
      // Optimistically remove from UI
setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
 
      // Try to delete via API
      try {
        await todoAPI.deleteTodo(id);
      } catch (apiError) {
        console.error('API delete failed, keeping local deletion:', apiError);
        // Keep the optimistic deletion if API fails
      }
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo');
      // Restore the todo if deletion failed
      if (todoToDelete) {
        setTodos(prevTodos => [...prevTodos, todoToDelete]);
      }
    } finally {
      setIsDeleting(null);
    }
  };
 
  // Filter todos based on current filter
  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'completed':
        return todo.completed;
      case 'pending':
        return !todo.completed;
      default:
        return true;
    }
  });
 
  // Calculate stats
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;
 
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading todos...</p>
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          To-Do List
        </h1>
        
        <p className="text-center text-sm text-gray-500 mb-4">
          Powered by DummyJSON API
        </p>
 
        {error && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Stats */}
        <div className="flex justify-center gap-6 mb-6 text-sm text-gray-600">
          <span>Total: {totalTodos}</span>
          <span>Pending: {pendingTodos}</span>
          <span>Completed: {completedTodos}</span>
        </div>
 
        <AddTodo onAddTodo={addTodo} isLoading={isAdding} />
        
        <Filter currentFilter={filter} onFilterChange={setFilter} />
        
        <TodoList
          todos={filteredTodos}
          onToggleComplete={toggleComplete}
          onDeleteTodo={deleteTodo}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
export default App;