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

// Zustand 상태 타입 정의
interface ChatStore {
  chatRooms: number[]; // 채팅방 목록
  activeChat: number; // 현재 활성화된 채팅방
  waitingForNewChat: boolean; // 새 채팅방 대기 상태
  startNewChat: () => void; // 새 채팅방 시작
  createNewChatRoom: (message: number) => void; // 채팅방 생성 및 첫 메시지 추가
  removeChatRoom: (chatId: number) => void; // 채팅방 삭제
  setActiveChat: (chatId: number) => void; // 활성 채팅방 변경
}

// 영구 상태 관리 (persist 사용)
export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      chatRooms: [], // 기본 채팅방 (영구 저장)
      activeChat: 1, // 첫 번째 채팅방을 활성화
      waitingForNewChat: false, // 초기 대기 상태는 false

      startNewChat: () => set({ activeChat: 1, waitingForNewChat: true }), // 새 채팅방 시작 (대기 상태로 변경)

      createNewChatRoom: (value) => {
        const newChatId = value; // 새 채팅방 ID 생성 예시
        set((state) => ({
          chatRooms: [...state.chatRooms, newChatId], // 기존 채팅방 유지 + 새 채팅방 추가
          activeChat: newChatId, // 새 채팅방 활성화
          waitingForNewChat: false, // 대기 상태 해제
        }));
      },

      removeChatRoom: (chatId) => {
        set((state) => {
          const updatedRooms = state.chatRooms.filter(
            (room) => room !== chatId
          );
          return {
            chatRooms: updatedRooms.length > 0 ? updatedRooms : [1], // 기본 채팅방으로 복귀
            activeChat: updatedRooms.length > 0 ? updatedRooms[0] : 1, // 첫 채팅방 활성화
            waitingForNewChat: false, // 대기 상태 해제
          };
        });
      },

      setActiveChat: (value) => {
        const newChatId = value; // 특정 채팅방을 활성화
        set({
          activeChat: newChatId,
        });
        console.log("여기는 store : " + newChatId);
      },
    }),
    { name: "chat-storage" } // 로컬스토리지에 저장
  )
);
