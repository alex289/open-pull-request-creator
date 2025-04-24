import * as vscode from 'vscode';
import { GitExtension } from './api/git';

export function getGitApi() {
  const gitExtension =
    vscode.extensions.getExtension<GitExtension>('vscode.git')!.exports;
  return gitExtension.getAPI(1);
}
