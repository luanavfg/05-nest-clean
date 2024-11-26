export abstract class HasherComparer {
  abstract compare(plain: string, hash: string): Promise<boolean>
}
