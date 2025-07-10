# Github Profile Fetcher

GitHub Profile Fetcher that retrieves user information, repositories, and statistics using the GitHub API.

## Features

- Fetch GitHub user profile data
- List user repositories with sorting/filtering
- Get repository statistics
- Rate limit handling
- Caching for performance
- CLI and programmatic interfaces

```bash
node cli.js profile <username>
# Example:
node cli.js profile octocat
```

## Future Enhancements

- Add more metrics (commit frequency, issue tracking)
- Support for private repos (with proper token scopes)
- Export to JSON/CSV
- Graphical visualization of stats
- Compare multiple users/repos
- Web interface with Express.js