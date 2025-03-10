import { create } from "zustand";
import { persist } from "zustand/middleware";

// 할 일 객체의 타입 정의
interface Todo {
  id: number;
  text: string;
  time: string;
}

interface TodoStore {
  todos: Todo[]; // Todo 배열
  addTodo: (newTodo: Todo) => void; // 새로운 할 일 추가
  deleteTodo: (id: number) => void; // 할 일 삭제
}

export const useStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [], // 초기 상태

      // 할 일 추가
      addTodo: (newTodo) =>
        set((state) => ({ todos: [...state.todos, newTodo] })),

      // 할 일 삭제
      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),
    }),
    { name: "app-storage" } // localStorage에 저장됨
  )
);
