import React from 'react';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps, StageFailureMessage } from '@spinnaker/core';

/*
 * You can use this component to provide information to users about
 * how the stage was configured and the results of its execution.
 *
 * In general, you will access two properties of `props.stage`:
 * - `props.stage.outputs` maps to your SimpleStage's `Output` class.
 * - `props.stage.context` maps to your SimpleStage's `Context` class.
 */
export function TerraformGateExecutionDetails(props: IExecutionDetailsSectionProps) {
  const getClasses = () => {
    let classes = '';
    if (props.stage.outputs.status == 'allow') {
      classes = 'terraformStatusSuccess';
    } else if (props.stage.outputs.status == 'deny') {
      classes = 'terraformStatusDanger';
    }
    return classes;
  };

  const getStatus = () => {
    let classes = '';
    if (props.stage.outputs.status == 'allow') {
      classes = 'Allow';
    } else if (props.stage.outputs.status == 'deny') {
      classes = 'Deny';
    }
    return classes;
  };

  const exceptionDiv = props.stage.outputs.exception ? (
    <div className="alert alert-danger">
      <div>
        <h5>Exception</h5>
        <div className="Markdown break-word">
          <p>{props.stage.outputs.exception}</p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <ExecutionDetailsSection name={props.name} current={props.current}>
      {props.stage.outputs.trigger_json !== undefined ? (
        <div>
          <div className="detailpagelogo">
            <img
              src="https://cd.foundation/wp-content/uploads/sites/78/2020/05/opsmx-logo-march2019.png"
              alt="logo"
              width="70px"
              style={{ marginLeft: 'auto' }}
            ></img>
          </div>
          <table className="table" style={{ marginTop: '15px' }}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Message</th>
                <th style={{ width: '90px' }}>Executed By</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className={'TerraformStatusSmall ' + getClasses()}>{getStatus()}</span>
                </td>
                <td>{props.stage.outputs.message}</td>
                <td>{props.stage.outputs.executedBy}</td>
                <td>{new Date(props.stage.endTime).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          {exceptionDiv}
        </div>
      ) : (
        <>
          {' '}
          <img
            src="https://cd.foundation/wp-content/uploads/sites/78/2020/05/opsmx-logo-march2019.png"
            alt="logo"
            width="80px"
            style={{ float: 'right', marginBottom: '10px' }}
          ></img>
          <StageFailureMessage stage={props.stage} message={props.stage.failureMessage} />
        </>
      )}
    </ExecutionDetailsSection>
  );
}

// The title here will be used as the tab name inside the
// pipeline stage execution view. Camel case will be mapped
// to space-delimited text: randomWait -> Random Wait.
export namespace TerraformGateExecutionDetails {
  export const title = 'Terraform';
}
