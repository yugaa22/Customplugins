import React, { ChangeEvent } from 'react';
import { createFakeReactSyntheticEvent, IFormInputProps } from '@spinnaker/core';
import type { IValidationCategory, IValidator } from '@spinnaker/core';

const epochToDate = (epoch: number) => {
  const d = new Date(0); // The 0 there is the key, which sets the date to the epoch
  d.setUTCMilliseconds(epoch);
  return d;
};

const epochToLocalTime = (epochString: any) => {
  if (epochString) {
    const inputDate = epochToDate(epochString);
    let hours = inputDate.getHours();
    let minutes: number | string = inputDate.getMinutes();
    hours = hours % 24;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    hours = hours ? hours : 0;
    const year = inputDate.getFullYear();
    let month: number | string = inputDate.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    let date: number | string = inputDate.getDate();
    date = date < 10 ? '0' + date : date;
    const strTime = year + '-' + month + '-' + date + 'T' + (hours > 9 ? hours : '0' + hours) + ':' + minutes;
    return strTime;
  } else {
    return null;
  }
};

const localTimeToEpoch = (selectedDate: string) => new Date(selectedDate).getTime();

export interface IFormInputValidation {
  touched: boolean;
  hidden: boolean;
  category: IValidationCategory | undefined;
  messageNode: React.ReactNode | undefined;
  revalidate: () => void;
  addValidator: (validator: IValidator) => void;
  removeValidator: (validator: IValidator) => void;
}

export interface IFormInputPropsPlugin extends IFormInputProps {
  validation?: IFormInputValidation;
  inputClassName?: string;
  disabled ? : boolean;
}
export class DateTimePicker extends React.Component<IFormInputProps> {
  public render() {
    const { onChange, name, value ,disabled} = this.props;

    const formattedDate = epochToLocalTime(value);

    return (
      <input
        style={{ width: '100%' }}
        type="datetime-local"
        {...this.props}
        value={formattedDate}
        disabled = {disabled}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const date = e.target.value;
          const newValue = localTimeToEpoch(date);
          onChange(createFakeReactSyntheticEvent({ name, value: newValue }));
        }}
      ></input>
    );
  }
}
