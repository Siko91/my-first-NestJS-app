export type PickWithout<T, K> = Pick<T, Exclude<keyof T, K>>;
