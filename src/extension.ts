import * as vscode from 'vscode';
import {
  getCurrentBranchFromCLI,
  getDefaultBranchFromCLI,
  getOriginUrlFromCLI,
  isGitRepo,
} from './git';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'open-pull-request-creator.createPR',
    async () => {
      console.log('[PR Helper] Extension "pr-after-commit-helper" activated.');
      if (!(await isGitRepo())) {
        return;
      }

      const currentBranch = await getCurrentBranchFromCLI();
      if (!currentBranch) {
        return;
      }

      const defaultBranch = await getDefaultBranchFromCLI();
      if (!defaultBranch) {
        return;
      }

      if (currentBranch === defaultBranch) {
        console.log(
          '[PR Helper] Current branch is the same as default branch. No PR needed.',
        );
        return;
      }

      const originUrl = await getOriginUrlFromCLI();
      if (!originUrl) {
        return;
      }

      const openPRButton = 'Open Create PR Page';
      vscode.window
        .showInformationMessage(
          `Create Pull Request for branch '${currentBranch}'?`,
          openPRButton,
        )
        .then((selection) => {
          if (selection === openPRButton) {
            vscode.env.openExternal(
              vscode.Uri.parse(
                getPullRequestUrl(originUrl, currentBranch, defaultBranch),
              ),
            );
          }
        });
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
    return (
      originUrl +
      `/pullrequestcreate?sourceRef=${currentBranch}&targetRef=${defaultBranch}`
    );
  }

  return originUrl;
}
