#!/usr/bin/env node
const { Command } = require('commander');
const chalk = require('chalk');
const GitHubAPI = require('./github-api');
const config = require('./config');

const c = chalk.default || chalk; // Fallback for older versions of chalk

const program = new Command();

program
  .name('github-fetcher')
  .description('Fetch GitHub profile and repository information')
  .version('1.0.0');

program
  .command('profile <username>')
  .description('Get user profile information')
  .option('-t, --token <token>', 'GitHub personal access token')
  .action(async (username, options) => {
    try {
      const github = new GitHubAPI(options.token);
      const profile = await github.getUserProfile(username);
      
      console.log(c.green.bold(`\nGitHub Profile: ${profile.login}`));
      console.log(c.blue(`Name: ${profile.name || 'Not specified'}`));
      console.log(`Bio: ${profile.bio || 'Not specified'}`);
      console.log(`Followers: ${profile.followers} | Following: ${profile.following}`);
      console.log(`Public Repos: ${profile.public_repos}`);
      console.log(`Created: ${new Date(profile.created_at).toLocaleDateString()}`);
      console.log(`Last updated: ${new Date(profile.updated_at).toLocaleDateString()}`);
      console.log(c.blue(`\nProfile URL: ${profile.html_url}`));
    } catch (error) {
      console.error(c.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('repos <username>')
  .description('Get user repositories')
  .option('-t, --token <token>', 'GitHub personal access token')
  .option('-s, --sort <field>', 'Sort by (created, updated, pushed, full_name)', 'updated')
  .option('-d, --direction <dir>', 'Sort direction (asc, desc)', 'desc')
  .option('-l, --limit <number>', 'Limit number of repos', parseInt)
  .action(async (username, options) => {
    try {
      const github = new GitHubAPI(options.token);
      const repos = await github.getUserRepos(username, {
        sort: options.sort,
        direction: options.direction
      });
      
      const limitedRepos = options.limit ? repos.slice(0, options.limit) : repos;
      
      console.log(c.green.bold(`\nRepositories for ${username} (${repos.length} total):`));
      
      const table = limitedRepos.map(repo => ({
        Name: c.blue(repo.name),
        Description: repo.description || 'No description',
        Stars: repo.stargazers_count,
        Forks: repo.forks_count,
        Updated: new Date(repo.updated_at).toLocaleDateString(),
        Languages: repo.languages.join(', ') || 'None'
      }));
      
      console.table(table);
    } catch (error) {
      console.error(c.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('repo <username> <repo>')
  .description('Get repository details')
  .option('-t, --token <token>', 'GitHub personal access token')
  .action(async (username, repo, options) => {
    try {
      const github = new GitHubAPI(options.token);
      const repoDetails = await github.getRepoDetails(username, repo);
      
      console.log(c.green.bold(`\nRepository: ${username}/${repo}`));
      console.log(c.blue(`Description: ${repoDetails.description || 'No description'}`));
      console.log(`Stars: ${repoDetails.stargazers_count} | Forks: ${repoDetails.forks_count}`);
      console.log(`Open Issues: ${repoDetails.open_issues_count}`);
      console.log(`License: ${repoDetails.license?.name || 'None'}`);
      console.log(`Primary Language: ${repoDetails.language || 'None'}`);
      console.log(`Languages: ${repoDetails.languages.join(', ') || 'None'}`);
      console.log(`Contributors: ${repoDetails.contributor_count}`);
      console.log(`Commits: ${repoDetails.commit_count}`);
      console.log(`Last Commit: ${repoDetails.last_commit ? new Date(repoDetails.last_commit).toLocaleString() : 'Unknown'}`);
      console.log(c.blue(`\nRepo URL: ${repoDetails.html_url}`));
    } catch (error) {
      console.error(c.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);