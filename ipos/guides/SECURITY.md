# Security
>

Each user will have a set of keychains which will be used with app's, data, etc...
Each app containing private data should consider using this.
Each app needing the use off permissions needs to implement, without permissions aren't supported and local access will not be allowed.

A user account is encrypted in the highest way possible, apps themselves less but still enough to be secure,
alternative login protections will follow soon (like yubico key's support & 2fa)

# Example
```js
class ClassName extends ProgramBase(HTMLElement) {
  constructor() {
    super();
  }
  connectedCallback() {
    // check if the chain is locked, unlock when it is.
    if (user.chain.locked) user.chain.unlock(password); // unlocks the chain
    this.key = user.chain.key(this.uid); // returns public & private keys for this app
  }
}
```
