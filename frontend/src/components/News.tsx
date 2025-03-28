import React, { useState, useEffect } from "react";
import "./News.css";
import axios from "axios";
import AOS from "aos";

// 뉴스 아이템 타입 정의
interface NewsItem {
  title: string;
  link: string;
  thumbnail: string;
  description: string;
  originallink: string;
  pubDate: string;
}

const TodoApp: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    AOS.init({
      duration: 1000, // 애니메이션 지속 시간 (ms)
      once: true, // 스크롤 한 번만 애니메이션 실행
      easing: "ease-in-out", // 애니메이션 가속도
    });
  }, []);
  const fetchNews = async (): Promise<void> => {
    const EX_IP = process.env.REACT_APP_API_URL_JAVA;

    if (!keyword) return;

    setIsLoading(true); // 데이터 요청 시작 시 로딩 상태 활성화

    try {
      const response = await axios.get<{ data: { items: NewsItem[] } }>(
        EX_IP + `/clushAPI/news/${encodeURIComponent(keyword)}`
      );
      setNews(response.data.data.items);
      console.log(news);
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
          🧠
        </button>
      </div>

      {/* ✅ 로딩 중 화면 표시 */}
      {isLoading ? (
        <div className="newsLoading">
          <img
            src="/image/MS_Icon.png"
            className="newsLoadingImg"
            alt="Loading..."
          />
          <br />
          <p>뉴스를 불러오는 중...</p>
        </div>
      ) : news.length > 0 ? (
        <div className="newsCellBody">
          {news.map((item, index) => (
            <div key={index} className="newsCell">
              <div className="newsInfo">
                <div className="newsCellTitle">
                  <a
                    href={item.originallink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {cleanChar(item.title)}
                  </a>
                </div>
                <br />
                <div className="newsCellDesc">
                  <a
                    href={item.originallink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {cleanChar(item.description)}
                  </a>
                </div>
                <br />
                <div className="newsCellDate">
                  {new Date(item.pubDate).toLocaleString()}
                </div>
              </div>

              <div className="newsThumbnailBox">
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  <img
                    src={item.thumbnail || "/image/MS_Icon.png"} // 썸네일이 없으면 기본 이미지를 사용
                    alt=""
                    className="newsThumbnail"
                  />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="newsCellBodyTemp">
          <div
            className="newsCellBodyTempText"
            data-aos="fade-down"
            data-aos-duration="1500"
          >
            무엇이든 검색해보세요!
          </div>
          <br />
          <div className="newsCellBodyTempImage">
            <img
              src="/image/MS_Icon.png"
              alt="Loading..."
              data-aos="fade-right"
              data-aos-duration="1500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoApp;
