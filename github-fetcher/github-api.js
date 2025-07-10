const axios = require('axios');
const NodeCache = require('node-cache');
const config = require('./config');

class GitHubAPI {
  constructor(token = null) {
    this.cache = new NodeCache({ stdTTL: config.CACHE_TTL });
    this.token = token;
    this.headers = {
      'User-Agent': config.USER_AGENT,
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (this.token) {
      this.headers['Authorization'] = `token ${this.token}`;
    }
  }

  async _makeRequest(endpoint) {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const url = `${config.GITHUB_API_URL}${endpoint}`;
      const response = await axios.get(url, { headers: this.headers });
      
      // Cache successful responses
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 403 && 
            error.response.headers['x-ratelimit-remaining'] === '0') {
          // Handle rate limiting
          const resetTime = new Date(error.response.headers['x-ratelimit-reset'] * 1000);
          const delay = resetTime - Date.now() + 1000;
          console.log(`Rate limited. Waiting ${Math.ceil(delay/1000)} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this._makeRequest(endpoint);
        }
        throw new Error(`GitHub API Error: ${error.response.status} - ${error.response.data.message}`);
      }
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  async getUserProfile(username) {
    return this._makeRequest(`/users/${username}`);
  }

  async getUserRepos(username, options = {}) {
    const { sort = 'updated', direction = 'desc', type = 'all' } = options;
    const repos = await this._makeRequest(`/users/${username}/repos?sort=${sort}&direction=${direction}&type=${type}`);
    
    // Add additional stats for each repo
    const reposWithStats = await Promise.all(
      repos.map(async repo => {
        const [languages, contributors] = await Promise.all([
          this._makeRequest(repo.languages_url),
          this._makeRequest(`${repo.url}/contributors?anon=1`)
        ]);
        return {
          ...repo,
          languages: Object.keys(languages || {}),
          contributor_count: contributors ? contributors.length : 0
        };
      })
    );
    
    return reposWithStats;
  }

  async getRepoDetails(username, repoName) {
    const [repo, languages, contributors, commits] = await Promise.all([
      this._makeRequest(`/repos/${username}/${repoName}`),
      this._makeRequest(`/repos/${username}/${repoName}/languages`),
      this._makeRequest(`/repos/${username}/${repoName}/contributors`),
      this._makeRequest(`/repos/${username}/${repoName}/commits`)
    ]);
    
    return {
      ...repo,
      languages: Object.keys(languages || {}),
      contributor_count: contributors ? contributors.length : 0,
      commit_count: commits ? commits.length : 0,
      last_commit: commits && commits[0] ? commits[0].commit.author.date : null
    };
  }
}

module.exports = GitHubAPI;