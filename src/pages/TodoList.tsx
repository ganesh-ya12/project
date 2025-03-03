import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CheckCircle, Circle, Trash, Plus } from 'lucide-react';
import AuthContext from '../context/AuthContext';

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/todos');
      setTodos(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch todos');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTodo.trim()) return;
    
    try {
      const res = await axios.post('/todos', { title: newTodo },{withCredentials:true});
      setTodos([res.data, ...todos]);
      setNewTodo('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add todo');
      console.error('Error adding todo:', err);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const res = await axios.put(`/todos/${id}`, { completed: !completed },{withCredentials:true});
      setTodos(todos.map(todo => (todo._id === id ? res.data : todo)));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await axios.delete(`/todos/${id}`,{withCredentials:true});
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Todo List</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={addTodo} className="mb-6">
          <div className="flex">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition flex items-center"
            >
              <Plus className="h-5 w-5 mr-1" />
              Add
            </button>
          </div>
        </form>
        
        {todos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No todos yet. Add one above!</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center">
                  <button
                    onClick={() => toggleTodo(todo._id, todo.completed)}
                    className="mr-3 text-gray-400 hover:text-blue-500 transition"
                  >
                    {todo.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>
                  <span
                    className={`${
                      todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
                    }`}
                  >
                    {todo.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo._id)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TodoList;