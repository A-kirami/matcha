import type { TypedSchema, GenericObject, SubmissionContext } from 'vee-validate'

// https://github.com/logaretm/vee-validate/issues/3521
export function getSubmitFn<TValues extends GenericObject = GenericObject, TOutput = TValues>(
  _: TypedSchema<TValues, TOutput>,
  callback: (values: TOutput, ctx: SubmissionContext<TValues>) => void | Promise<void>,
) {
  return async (values: GenericObject, ctx: SubmissionContext<TValues>): Promise<void> => {
    await callback(values as TOutput, ctx)
  }
}
