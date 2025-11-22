/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import { FilterEnum, Footer } from './components/Footer/footer';
import { Error } from './components/Error/errorMessage';
import { Header } from './components/Header/header';
import { TodoItem } from './components/TodoItem/todoItem';
import * as todoService from './api/todos';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filter, setFilter] = useState<FilterEnum>(FilterEnum.all);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filteredTodos, setFilteredTodos] = useState<Todo[] | null>(todos);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    async function fetchTodos() {
      try {
        const todosFromServer = await getTodos();

        setTodos(todosFromServer);
      } catch (error) {
        setErrorMessage('Unable to load todos');
        setTimeout(() => setErrorMessage(null), 3000);
      }
    }

    fetchTodos();
  }, []);

  useEffect(() => {
    if (filter && todos) {
      switch (filter) {
        case FilterEnum.all:
          setFilteredTodos(todos);
          break;
        case FilterEnum.active:
          setFilteredTodos(todos.filter(todo => !todo.completed));
          break;
        case FilterEnum.completed:
          setFilteredTodos(todos.filter(todo => todo.completed));
          break;
        default:
          setFilteredTodos(todos);
          break;
      }
    }
  }, [filter, todos]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  function toggleTodoCompleted(todoId: number) {
    setTodos(prevTodos => {
      if (!prevTodos) {
        return prevTodos;
      }

      setIsLoaded(true);
      setTimeout(() => {
        setIsLoaded(false);
      }, 100);

      return prevTodos.map(todo =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      );
    });
  }

  function handleDeleteTodo(todoId: number) {
    setIsAdding(true);
    todoService
      .deleteTodo(todoId)
      .then(() => {
        setTodos(prev => prev.filter(todo => todo.id !== todoId));
      })
      .catch(() => {
        setErrorMessage('Unable to delete todo');
      })
      .finally(() => {
        setIsAdding(false);
      });
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          setTodos={setTodos}
          setErrorMessage={setErrorMessage}
          setTempTodo={setTempTodo}
          userId={USER_ID}
          setIsAdding={setIsAdding}
          setTitle={setTitle}
          title={title}
          isAdding={isAdding}
        />

        <section className="todoapp__main" data-cy="TodoList">
          {filteredTodos?.map((todo: Todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isLoaded={isLoaded}
              deleteTodo={handleDeleteTodo}
              toggleTodoCompleted={toggleTodoCompleted}
            />
          ))}
        </section>

        {todos && todos.length > 0 && (
          <Footer todos={todos} filter={filter} setFilter={setFilter} />
        )}
      </div>

      <Error errorMsg={errorMessage} />
    </div>
  );
};
