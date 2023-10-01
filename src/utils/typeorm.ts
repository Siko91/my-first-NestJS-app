import { DataSource, QueryRunner } from 'typeorm';

export async function saveMultipleDocsInTransaction(
  dataSource: DataSource,
  documentsToSave: any[],
) {
  return await runInTransaction(dataSource, async (queryRunner) => {
    for (const docToSave of documentsToSave) {
      await queryRunner.manager.save(docToSave);
    }
  });
}

export async function runInTransaction(
  dataSource: DataSource,
  action: (queryRunner: QueryRunner, dataSource: DataSource) => Promise<void>,
) {
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    await action(queryRunner, dataSource);

    await queryRunner.commitTransaction();
  } catch (err) {
    // since we have errors lets rollback the changes we made
    await queryRunner.rollbackTransaction();

    throw err;
  } finally {
    // you need to release a queryRunner which was manually instantiated
    await queryRunner.release();
  }
}
