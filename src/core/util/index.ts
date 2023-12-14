export function isString(s: string): boolean {
  return typeof s === 'string';
}

export function wait(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

export function isNotEmpty(value: any) {
  return value !== undefined && value !== null && value !== '';
}
