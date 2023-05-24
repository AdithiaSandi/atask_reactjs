import "./App.css";
import { Octokit } from "octokit";
import { useState } from "react";
import { BeatLoader } from "react-spinners";

function App() {
  const [query, setQuery] = useState("");
  const [temp, setTemp] = useState("");
  const [loading, setLoading] = useState(Boolean);
  const [landing, setLanding] = useState(true);
  const [results, setResults] = useState([]);
  const [repo, setRepo] = useState(Object);

  const octokit = new Octokit({
    auth: process.env.TOKEN,
  });

  const repos = async (name) => {
    await octokit
      .request(`GET /users/{username}/repos?sort=created`, {
        username: name,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      })
      .then((res) => {
        console.log(res);
        setRepo((prev) => {
          return {
            ...prev,
            [name]: res.data,
          };
        });
      })
      .catch((err) => {
        alert(err);
      });
  };

  const users = async (e) => {
    e.preventDefault();
    setLanding(false);
    setLoading(true);
    const q = query.split(" ").join("+");
    await octokit
      .request(`GET /search/users?q=${q}&per_page=5`, {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      })
      .then((res) => {
        console.log(res);
        setTemp(query);
        setLoading(false);
        setResults(res.data.items);
        res.data.items.map((item) => repos(item.login));
      })
      .catch((err) => {
        alert(err);
      });
  };

  const handleInput = (e) => {
    setQuery(e.target.value);
  };

  const toggleActive = (e) => {
    const children = document.querySelectorAll(".items-container div.user");
    e.target.parentElement.parentElement.className === "user active"
      ? (e.target.parentElement.parentElement.className = "user")
      : children.forEach((item) => {
          item.id === e.target.parentElement.parentElement.id
            ? (item.className = "user active")
            : (item.className = "user");
        });
    console.log(e.target.parentElement.parentElement.id);
    console.log(children);
  };

  return (
    <div className="App">
      <div className="search-container">
        <form onSubmit={(e) => users(e)}>
          <input
            type="text"
            placeholder="Input username..."
            className="input-form"
            id="input-form"
            onChange={(e) => handleInput(e)}
          ></input>
          <button
            className="input-btn"
            type="submit"
            onClick={(e) => users(e)}
            disabled={query.length === 0}
          >
            Find
          </button>
        </form>
      </div>
      <div className="results-container" hidden={landing}>
        {loading ? (
          <div className="loading">
            <BeatLoader color="#36d7b7" />
          </div>
        ) : (
          <>
            <p>Top 5 results for "{temp}"</p>
            <div className="items-container">
              {results.map((item, index) => {
                return (
                  <div className="user" key={index} id={"user-" + index}>
                    <button
                      className="toggle-btn"
                      id={"btn-" + index}
                      onClick={(e) => toggleActive(e)}
                    >
                      <span>{item.login}</span>
                      <img
                        src="https://www.svgrepo.com/show/511472/arrow-up-337.svg"
                        alt=""
                      />
                    </button>
                    {repo[item.login] === undefined ? (
                      <div className="loading">
                        <BeatLoader color="#36d7b7" />
                      </div>
                    ) : (
                      <div className="repo-container">
                        {repo[item.login].length === 0 ? (
                          <h1>&lt;NO REPOSITORY&gt;</h1>
                        ) : (
                          repo[item.login].map((item, index) => {
                            return (
                              <div key={index} className="detail">
                                <h3>{item.name}</h3>
                                <div>{item.stargazers_count}🌟</div>
                                <p>
                                  {item.description === null
                                    ? "<No Description>"
                                    : item.description}
                                </p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
