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
      addTodo: (newTodo) => {
        const currentTime = new Date()
          .toISOString() // UTC로 ISO 형식 (YYYY-MM-DDTHH:mm:ss.sssZ)
          .slice(0, 16) // 'YYYY-MM-DDTHH:mm' 까지 자르고
          .replace("T", " "); // 'T'를 공백으로 변경하여 'YYYY-MM-DD HH:mm' 형식으로 저장
        set((state) => ({
          todos: [...state.todos, { ...newTodo, time: currentTime }],
        }));
      },

      // 할 일 삭제
      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),
    }),
    { name: "app-storage" } // localStorage에 저장됨
  )
);
