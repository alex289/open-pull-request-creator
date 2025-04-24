import * as vscode from "vscode";
import * as cp from "child_process";
import * as util from "util"; // For promisify

const exec = util.promisify(cp.exec);

export async function isGitRepo(): Promise<boolean> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    console.error("No workspace folder open.");
    return false;
  }
  const cwd = workspaceFolders[0].uri.fsPath;

  try {
    const { stdout, stderr } = await exec(
      "git rev-parse --is-inside-work-tree",
      {
        cwd,
      },
    );

    if (stderr) {
      console.error(`Git command stderr: ${stderr}`);
      return false;
    }

    const isGitRepo = stdout.trim() === "true";
    return isGitRepo;
  } catch (error: any) {
    console.error(`Failed to execute git command: ${error.message}`);
    return false;
  }
}

export async function getCurrentBranchFromCLI(): Promise<string | null> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    console.error("No workspace folder open.");
    return null;
  }
  const cwd = workspaceFolders[0].uri.fsPath;

  try {
    const { stdout, stderr } = await exec("git branch --show-current", {
      cwd,
    });

    if (stderr) {
      console.error(`Git command stderr: ${stderr}`);
      return null;
    }

    const branchName = stdout.trim();

    if (branchName === "HEAD") {
      console.warn("Currently in detached HEAD state.");
      return null;
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
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    console.error("No workspace folder open.");
    return null;
  }
  const cwd = workspaceFolders[0].uri.fsPath;

  try {
    const { stdout, stderr } = await exec("git remote show origin", { cwd });

    if (stderr) {
      console.error(`Git command stderr: ${stderr}`);
      return null;
    }

    const lines = stdout.split("\n");
    const headBranchLine = lines.find((line) =>
      line.trim().startsWith("HEAD branch:"),
    );

    if (headBranchLine) {
      const branchName = headBranchLine.split(":")[1]?.trim();
      if (branchName && branchName !== "(unknown)") {
        console.log(
          `[PR Helper] Detected default branch via remote show: ${branchName}`,
        );
        return branchName;
      }
      console.warn(
        `[PR Helper] Could not parse branch name from 'git remote show' output line: ${headBranchLine}`,
      );
      return null;
    }
    console.warn(
      `[PR Helper] 'HEAD branch:' line not found in 'git remote show origin' output.`,
    );
    console.log(`[PR Helper] Full output:\n${stdout}`);
    return null;
  } catch (error: any) {
    console.error(`Failed to execute git command: ${error.message}`);
    vscode.window.showErrorMessage(
      `Failed to get default branch: ${error.message}`,
    );
    return null;
  }
}

export async function getOriginUrlFromCLI(): Promise<string | null> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    console.error("No workspace folder open.");
    return null;
  }
  const cwd = workspaceFolders[0].uri.fsPath;

  try {
    const { stdout, stderr } = await exec("git remote get-url origin", { cwd });

    if (stderr) {
      console.error(`Git command stderr: ${stderr}`);
      return null;
    }

    const url = stdout.trim();
    return url;
  } catch (error: any) {
    console.error(`Failed to execute git command: ${error.message}`);
    vscode.window.showErrorMessage(
      `Failed to get git remote URL: ${error.message}`,
    );
    return null;
  }
}
