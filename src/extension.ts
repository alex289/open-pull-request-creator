import * as vscode from 'vscode';
import { getGitApi } from './git';

export function activate(context: vscode.ExtensionContext) {
  console.log('[PR Helper] Extension "pr-after-commit-helper" activated.');

  const disposable = vscode.commands.registerCommand(
    'open-pull-request-creator.createPR',
    () => {
      const git = getGitApi();

      if (!git) {
        console.error('[PR Helper] Git extension not found.');
        return;
      }

      const repository = git.repositories[0];
      if (!repository) {
        vscode.window.showErrorMessage(
          'No Git repository found in the current workspace.',
        );
        return;
      }

      const originUrl = repository.state.remotes.find(
        (remote) => remote.name === 'origin',
      )?.fetchUrl;

      if (!originUrl) {
        vscode.window.showErrorMessage(
          'No remote repository found in the current Git repository.',
        );
        return;
      }

      const currentBranch = repository.state.HEAD?.name;

      if (!currentBranch) {
        vscode.window.showErrorMessage(
          'No current branch found in the Git repository.',
        );
        return;
      }

      vscode.env.openExternal(
        vscode.Uri.parse(getPullRequestUrl(originUrl, currentBranch, 'main')),
      );
    },
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  console.log('[PR Helper] Extension "pr-after-commit-helper" deactivated.');
}

function getPullRequestUrl(
  originUrl: string,
  currentBranch: string,
  defaultBranch: string,
): string {
  if (originUrl.startsWith('https://github.com')) {
    return originUrl + '/compare/' + defaultBranch + '...' + currentBranch;
  }

  if (originUrl.includes('dev.azure.com')) {
    const atIndex = originUrl.indexOf('@');

    if (atIndex === -1) {
      return (
        originUrl +
        `/pullrequestcreate?sourceRef=${currentBranch}&targetRef=${defaultBranch}`
      );
    }

    let newUrl = originUrl;

    if (atIndex !== -1) {
      newUrl = originUrl.substring(atIndex + 1);
      const protocolEndIndex = newUrl.indexOf('//');
      if (protocolEndIndex === -1) {
        newUrl = 'https://' + newUrl;
      }
    }
    return (
      newUrl +
      `/pullrequestcreate?sourceRef=${currentBranch}&targetRef=${defaultBranch}`
    );
  }

  return originUrl;
}
