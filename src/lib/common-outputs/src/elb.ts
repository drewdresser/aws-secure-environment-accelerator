import * as t from 'io-ts';
import { createStructuredOutputFinder } from './structured-output';
import { enums, optional, defaulted } from '@aws-accelerator/common-types';
import { StackOutput } from './stack-output';

export const LoadBalancerType = enums('LoadBalancerType', ['APPLICATION', 'NETWORK', 'GATEWAY']);
export type LoadBalancerType = t.TypeOf<typeof LoadBalancerType>;

export const ElbEndpoint = t.interface({
  az: t.string,
  id: t.string,
  vpc: t.string,
  subnet: t.string,
  accountKey: t.string,
});

export const LoadBalancerOutput = t.interface(
  {
    accountKey: t.string,
    region: t.string,
    dnsName: t.string,
    name: t.string,
    displayName: t.string,
    type: LoadBalancerType,
    arn: t.string,
    hostedZoneId: optional(t.string),
    targets: t.record(t.string, t.string),
  },
  'LoadBalancerOutput',
);

export type LoadBalancerOutput = t.TypeOf<typeof LoadBalancerOutput>;

export const LoadBalancerEndpointOutput = t.interface(
  {
    elbAccountKey: t.string,
    region: t.string,
    elbName: t.string,
    az: t.string,
    id: t.string,
    vpc: t.string,
    subnet: t.string,
    accountKey: t.string,
    serviceId: t.string,
  },
  'LoadBalancerEndpointsOutput',
);

export type LoadBalancerEndpointOutput = t.TypeOf<typeof LoadBalancerEndpointOutput>;

export const LoadBalancerOutputFinder = createStructuredOutputFinder(LoadBalancerOutput, finder => ({
  tryFindOneByName: (props: { outputs: StackOutput[]; name: string; accountKey?: string; region?: string }) =>
    finder.tryFindOne({
      outputs: props.outputs,
      predicate: output =>
        output.name === props.name &&
        (props.accountKey === undefined || output.accountKey === props.accountKey) &&
        (props.region === undefined || output.region === props.region),
    }),
}));

export const LoadBalancerEndpointOutputFinder = createStructuredOutputFinder(LoadBalancerEndpointOutput, finder => ({
  tryFindOneByName: (props: {
    outputs: StackOutput[];
    elbName: string;
    accountKey: string;
    region: string;
    vpcName: string;
    az: string;
    elbAccountKey?: string;
  }) =>
    finder.tryFindOne({
      outputs: props.outputs,
      predicate: output =>
        output.elbName === props.elbName &&
        output.accountKey === props.accountKey &&
        (props.elbAccountKey === undefined || output.elbAccountKey === props.elbAccountKey) &&
        output.region === props.region &&
        output.az === props.az &&
        output.vpc === props.vpcName,
    }),
  tryFindOneByServiceId: (props: { outputs: StackOutput[]; serviceId: string; accountKey?: string; region?: string }) =>
    finder.findAll({
      outputs: props.outputs,
      predicate: output =>
        (props.accountKey === undefined || output.elbAccountKey === props.accountKey) &&
        (props.region === undefined || output.region === props.region) &&
        output.serviceId === props.serviceId,
    }),
  tryFindOneByAccount: (props: { outputs: StackOutput[]; accountKey?: string; region?: string }) =>
    finder.findAll({
      outputs: props.outputs,
      predicate: output => props.accountKey === undefined || output.elbAccountKey === props.accountKey,
    }),
}));
