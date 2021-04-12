import { getTableNames, getPreviousDeploymentRecord } from '../../utils/amplify-resource-state-utils';
import { CloudFormation } from 'aws-sdk';

const cfnClientStub = ({
  describeStackResources: ({ StackName }) => ({
    promise: () => ({
      StackResources: [{
        LogicalResourceId: 'LogicalResourceIdTest1',
        PhysicalResourceId: 'PhysicalResourceIdTest',
      }],
    }),
  }),
  describeStacks: ({ StackName }) => ({
    promise: () => ({
      Stacks: [{
        Outputs: [
          {
            OutputKey: 'GetAttLogicalResourceIdTest1TableName',
            OutputValue: 'TestStackOutputValue1',
          },
          {
            OutputKey: 'InvalidLogicalResourceIdTableName',
            OutputValue: 'TestStackOutputValue2',
          },
        ],
        Parameters: [
          {
            ParameterKey: 'TestParameterKey1',
            ParameterValue: 'TestParameterValue1',
          },
        ],
        Capabilities: [
          'CAPABILITY_IAM',
        ],
      }],
    }),
  }),
} as unknown) as CloudFormation;

describe('amplify-resource-state-utils', () => {
  const StackID = 'TestSTackID';

  test('test getTableNames', async () => {
    const tables = ['LogicalResourceIdTest1', 'LogicalResourceIdTest2'];
    const expectedTableNameMap: Map<string, string> = new Map();
    expectedTableNameMap.set('LogicalResourceIdTest1', 'TestStackOutputValue1');

    const tableNames = await getTableNames(cfnClientStub, tables, StackID);
    expect(tableNames).toEqual(expectedTableNameMap);
  });
});