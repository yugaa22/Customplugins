import React, { useState } from 'react';

export default function DateTimePicker(props: any) {
  let unix_seconds = (selectedVal: string) => new Date(selectedVal).getTime() / 1000;
  return <input type="datetime-local" {...props}></input>;
}
