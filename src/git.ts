import * as vscode from "vscode";
import * as cp from "child_process";
import * as util from "util"; // For promisify

// Promisify exec for easier async/await usage
const exec = util.promisify(cp.exec);

export async function getCurrentBranchFromCLI(): Promise<string | null> {
  // Get the workspace folder path
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    console.error("No workspace folder open.");
    return null;
  }
  // Assuming the first workspace folder is the root of your git repo
  const cwd = workspaceFolders[0].uri.fsPath;

  try {
    // Execute the git command to get the current branch name
    const { stdout, stderr } = await exec("git rev-parse --abbrev-ref HEAD", {
      cwd,
    });

    if (stderr) {
      console.error(`Git command stderr: ${stderr}`);
      // Decide if stderr indicates a real error or just info
      // For this command, stderr usually means an error (e.g., not a git repo)
      return null;
    }

    // Trim whitespace (like the newline character) from the output
    const branchName = stdout.trim();

    // Handle detached HEAD state
    if (branchName === "HEAD") {
      console.warn("Currently in detached HEAD state.");
      // You might want to get the commit hash instead in this case
      // const { stdout: commitHash } = await exec('git rev-parse HEAD', { cwd });
      // return commitHash.trim();
      return null; // Or handle as needed
    }

    return branchName;
  } catch (error: any) {
    console.error(`Failed to execute git command: ${error.message}`);
    vscode.window.showErrorMessage(
      `Failed to get git branch: ${error.message}`,
    );
    return null;
  }
}

export async function getDefaultBranchFromCLI(): Promise<string | null> {
  // Get the workspace folder path
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    console.error("No workspace folder open.");
    return null;
  }
  // Assuming the first workspace folder is the root of your git repo
  const cwd = workspaceFolders[0].uri.fsPath;

  try {
    // Execute the git command to get the default branch name
    const { stdout, stderr } = await exec(
      "git remote show origin | grep 'HEAD branch' | cut -d' ' -f3",
      { cwd },
    );

    if (stderr) {
      console.error(`Git command stderr: ${stderr}`);
      return null;
    }

    // Trim whitespace (like the newline character) from the output
    const defaultBranchName = stdout.trim();

    return defaultBranchName;
  } catch (error: any) {
    console.error(`Failed to execute git command: ${error.message}`);
    vscode.window.showErrorMessage(
      `Failed to get default branch: ${error.message}`,
    );
    return null;
  }
}

// --- Inside your command or event handler ---
// const currentBranch = await getCurrentBranchFromCLI();
// if (currentBranch) {
//    console.log(`Current branch (from CLI): ${currentBranch}`);
//    // ... proceed to get remote URL (also via CLI) and build PR link
// }
// ---
