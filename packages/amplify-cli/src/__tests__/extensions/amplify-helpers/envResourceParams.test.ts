import * as fs from 'fs-extra';
import { getEnvInfo } from '../../../extensions/amplify-helpers/get-env-info';
import { saveEnvResourceParameters } from '../../../../src/extensions/amplify-helpers/envResourceParams';
import { pathManager, stateManager, $TSContext } from 'amplify-cli-core';

jest.mock('fs-extra');
jest.mock('amplify-cli-core', () => ({
  pathManager: { getTeamProviderInfoFilePath: jest.fn() },
  stateManager: {
    getTeamProviderInfo: jest.fn(),
    setTeamProviderInfo: jest.fn(),
    getDeploymentSecrets: jest.fn(),
    setDeploymentSecrets: jest.fn(),
    getLocalEnvInfo: jest.fn().mockReturnValue({ envName: 'testEnv' }),
  },
  removeFromDeploymentSecrets: jest.fn(),
}));
jest.mock('../../../../src/extensions/amplify-helpers/get-env-info', () => ({ getEnvInfo: jest.fn() }));

beforeAll(() => {
  (fs.existsSync as any).mockReturnValue(true);
  (getEnvInfo as any).mockReturnValue({ envName: 'testEnv' });
  (pathManager.getTeamProviderInfoFilePath as any).mockReturnValue('test/path');
});

test('saveEnvResourceParams appends to existing params', () => {
  const contextStub = {};
  const existingParams = {
    testEnv: {
      awscloudformation: {
        StackId:
          'arn:aws:cloudformation:us-east-1:1234567891011:stack/amplify-teamprovider-dev-134909/df33f4d0-1895-11eb-a8b4-0e706f74ed45',
      },
      categories: {
        testCategory: {
          testResourceName: {
            existingParam: 'existingParamValue',
          },
        },
      },
    },
  };
  (stateManager.getTeamProviderInfo as any).mockReturnValue(existingParams);

  saveEnvResourceParameters((contextStub as unknown) as $TSContext, 'testCategory', 'testResourceName', { newParam: 'newParamValue' });

  const setTeamProviderInfoMock: any = stateManager.setTeamProviderInfo;
  expect(setTeamProviderInfoMock).toHaveBeenCalled();
  const callParams = setTeamProviderInfoMock.mock.calls[0];
  //expect(callParams[0]).toEqual('test/path');
  const expectedParams = {
    testEnv: {
      awscloudformation: {
        StackId:
          'arn:aws:cloudformation:us-east-1:1234567891011:stack/amplify-teamprovider-dev-134909/df33f4d0-1895-11eb-a8b4-0e706f74ed45',
      },
      categories: {
        testCategory: {
          testResourceName: {
            existingParam: 'existingParamValue',
            newParam: 'newParamValue',
          },
        },
      },
    },
  };
  expect(callParams[1]).toEqual(expectedParams);
});
