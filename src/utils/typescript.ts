/**
 * The PickWithout TS Type is essentially the inverse of the standard NodeJS "Pick" Type.
 *
 * Pick<T, 'key1'| 'key2'> would define a type that has 'key1' and 'key2' fields with value types matching whatever is in T.
 * PickWithout<T, 'key1'| 'key2'> would define a type that has all properties of T, except 'key1' and 'key2'.
 *
 * The biggest advantage of defining types like that is how introducing a breaking change into the root type will cause the secondary type to fail to compile.
 * In other words - compile time errors instead of runtime errors.
 * Writing types in this way can save A LOT of debugging time.
 *
 * Here are some more advanced examples for a base type ( T = { f1:X, f2:X, f3?:X, f4:X } ):
 *
 * - Partial<PickWithout<T, "f1">> -----------------------------------> { f3?:X, f4?:X }
 * - Pick<T,"f1"> & Partial<PickWithout<T, "f1"|"f2">> ---------------> { f1:X, f3?:X, f4?:X }
 * - PickWithout<T, "f1"> & { f1:Y } ---------------------------------> { f1:Y, f2:X f3?:X, f4:X }
 *
 * I used this in a few places in this project. Check them out.
 */
export type PickWithout<T, K> = Pick<T, Exclude<keyof T, K>>;
