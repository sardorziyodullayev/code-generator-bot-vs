export declare type EntityFieldsNames<Entity> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof Entity]: Entity[P] extends Function ? never : P;
}[keyof Entity];

export type QuerySortType = 1 | -1; // | { $meta: 'textScore' };

export type QuerySort<Entity> = {
  [P in EntityFieldsNames<Entity>]?: QuerySortType;
};
