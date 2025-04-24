import * as vscode from "vscode";
import { getCurrentBranchFromCLI } from "./git";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "open-pull-request-creator.createPR",
    async () => {
      const currentBranch = await getCurrentBranchFromCLI();
      vscode.window.showInformationMessage(
        "Current branch (from CLI): " + currentBranch,
      );
    },
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
