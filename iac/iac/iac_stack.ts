import {
  Stack,
  StackProps,
  Duration,
  CfnOutput,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaStack } from './lambda_stack';
import { envs as environments } from '../envs';
import { ComparisonOperator } from 'aws-cdk-lib/aws-cloudwatch';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';

export class IacStack extends Stack {
  constructor(scope: Construct, constructId: string, props?: StackProps) {
    super(scope, constructId, props);
    const githubRef = process.env.GITHUB_REF || '';

    let stage;
    if (githubRef.includes('prod')) {
      stage = 'PROD';
    } else if (githubRef.includes('homolog')) {
      stage = 'HOMOLOG';
    } else if (githubRef.includes('dev')) {
      stage = 'DEV';
    } else {
      stage = 'TEST';
    }

    const envs = {
      'STAGE': stage
    };

    const lambdaStack = new LambdaStack(this, envs);

    const alarm = lambdaStack.lambdaFunction.metricInvocations({
      period: Duration.hours(6)
    }).createAlarm(this, `${environments.PROJECT_NAME}LambdaAlarm`, {
      threshold: 5000,
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD
    })

    const topic = Topic.fromTopicArn(this, `${environments.PROJECT_NAME}Topic`,
      `arn:aws:sns:${environments.AWS_REGION}:${environments.AWS_ACCOUNT_ID}:sns-battlesnake`
    )
    const snsAction = new SnsAction(topic)
    alarm.addAlarmAction(snsAction)

    const region = environments.AWS_REGION
    const logGroupName = `/aws/lambda/${lambdaStack.lambdaFunction.functionName}`
    const cloudwatchLogsUrl = `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logsV2:log-groups/log-group/${logGroupName.replace(/\//g, '$252F')}`

    new CfnOutput(this, 'CloudWatchLogs', {
      value: cloudwatchLogsUrl,
      exportName: `${environments.PROJECT_NAME}CloudWatchLogsValue`
    });

    new CfnOutput(this, 'LambdaConsole', {
      value: `https://${region}.console.aws.amazon.com/lambda/home?region=${region}#/functions/${lambdaStack.lambdaFunction.functionName}?tab=code`,
      exportName: `${environments.PROJECT_NAME}LambdaConsoleValue`
    })
  }
}
