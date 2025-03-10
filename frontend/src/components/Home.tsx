import React, { useState } from "react";
import "./Home.css";
import axios from "axios";

// 뉴스 아이템 타입 정의
interface NewsItem {
  title: string;
  description: string;
  originallink: string;
  pubDate: string;
}

const TodoApp: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchNews = async (): Promise<void> => {
    if (!keyword) return;

    setIsLoading(true); // 데이터 요청 시작 시 로딩 상태 활성화
    const EX_IP = process.env.REACT_APP_EX_IP || "https://clush.shop:7777";

    try {
      const response = await axios.get<{ data: { items: NewsItem[] } }>(
        `${EX_IP}/clushAPI/news/${encodeURIComponent(keyword)}`
      );
      setNews(response.data.data.items);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false); // 요청 완료 후 로딩 상태 비활성화
    }
  };

  const cleanChar = (title: string): string => {
    if (!title) return "";
    return title
      .replace(/&quot;/g, '"')
      .replace(/<br\s*\/?>/g, " ")
      .replace(/<b>/g, " ")
      .replace(/<\/b>/g, " ");
  };

  return (
    <div>
      <div className="newsSearchBar">
        <img src="/image/logo.jpg" alt="Loading..." />
        <input
          type="text"
          value={keyword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setKeyword(e.target.value)
          }
          className="newsSearchInputBar"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              fetchNews();
            }
          }}
        />
        <button className="newsSearchBtn" onClick={fetchNews}>
          🔍
        </button>
      </div>

      {/* ✅ 로딩 중 화면 표시 */}
      {isLoading ? (
        <div className="newsLoading">
          <img src="/image/logo.jpg" alt="Loading..." />
          <br />
          <p>뉴스를 불러오는 중...</p>
        </div>
      ) : news.length > 0 ? (
        <div className="newsCellBody">
          {news.map((item, index) => (
            <div key={index} className="newsCell">
              <h3 className="newsCellTitle">{cleanChar(item.title)}</h3>
              <h4 className="newsCellDesc">{cleanChar(item.description)}</h4>
              <a
                href={item.originallink}
                target="_blank"
                rel="noopener noreferrer"
                className="newsCellNewsLink"
              >
                원본 기사 보기
              </a>
              <p>{new Date(item.pubDate).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="newsCellBodyTemp">
          <div className="newsCellBodyTempText">무엇이든 검색해보세요!</div>
          <br />
          <div className="newsCellBodyTempImage">
            <img src="/image/MS_Icon.png" alt="Loading..." />
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoApp;
