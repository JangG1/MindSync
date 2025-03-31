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
    (set, get) => ({
      todos: [], // 초기 상태

      // 할 일 추가
      addTodo: (newTodo) => {
        const currentTime = new Date();
        const localDate =
          currentTime.getFullYear() +
          "/" +
          String(currentTime.getMonth() + 1).padStart(2, "0") +
          "/" +
          String(currentTime.getDate()).padStart(2, "0") +
          " " +
          String(currentTime.getHours()).padStart(2, "0") +
          ":" +
          String(currentTime.getMinutes()).padStart(2, "0");

        set((state) => ({
          todos: [...state.todos, { ...newTodo, time: localDate }],
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

export interface ChatRoom {
  roomNo: number;
  title: string;
  createdAt: string;
}

interface ChatStore {
  chatRooms: ChatRoom[];
  activeChat: number; // 활성화된 채팅방의 roomNo
  waitingForNewChat: boolean;
  getInChat: (value: boolean) => void;
  createFirstChatRoom: (roomNo: number, title: string) => void;
  createNewChatRoom: (roomNo: number, title: string) => void;
  removeChatRoom: (roomNo: number) => void;
  setActiveChat: (roomNo: number) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      chatRooms: [],
      activeChat: 1,
      waitingForNewChat: false,

      getInChat: (value) => set({ waitingForNewChat: value }),

      createFirstChatRoom: (roomNo, title) => {
        const currentTime = new Date();
        const localDate =
          currentTime.getFullYear() +
          "." +
          String(currentTime.getMonth() + 1).padStart(2, "0") +
          "." +
          String(currentTime.getDate()).padStart(2, "0") +
          " " +
          String(currentTime.getHours()).padStart(2, "0") +
          ":" +
          String(currentTime.getMinutes()).padStart(2, "0");

        const newRoom: ChatRoom = {
          roomNo,
          title,
          createdAt: localDate,
        };

        set(() => ({
          chatRooms: [newRoom],
          activeChat: roomNo,
        }));
      },

      createNewChatRoom: (roomNo, title) => {
        const currentTime = new Date();
        const localDate =
          currentTime.getFullYear() +
          "." +
          String(currentTime.getMonth() + 1).padStart(2, "0") +
          "." +
          String(currentTime.getDate()).padStart(2, "0") +
          " " +
          String(currentTime.getHours()).padStart(2, "0") +
          ":" +
          String(currentTime.getMinutes()).padStart(2, "0");

        const newRoom: ChatRoom = {
          roomNo,
          title,
          createdAt: localDate,
        };
        set((state) => ({
          chatRooms: [...state.chatRooms, newRoom],
          activeChat: roomNo,
        }));
      },

      removeChatRoom: (roomNo) =>
        set((state) => {
          const updatedRooms = state.chatRooms.filter(
            (room) => room.roomNo !== roomNo
          );
          return {
            chatRooms: updatedRooms,
            activeChat: updatedRooms.length > 0 ? updatedRooms[0].roomNo : 1,
            waitingForNewChat: false,
          };
        }),

      setActiveChat: (roomNo) => {
        set({ activeChat: roomNo });
        console.log("Active chat room: " + roomNo);
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        chatRooms: state.chatRooms,
        activeChat: state.activeChat,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setActiveChat(
            state.chatRooms.length > 0
              ? state.chatRooms[state.chatRooms.length - 1].roomNo
              : 1
          );
        }
      },
    }
  )
);
