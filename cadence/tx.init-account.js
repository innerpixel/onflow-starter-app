import * as fcl from "@onflow/fcl";

export async function initAccount() {
  const txId = await fcl
    .send([
      fcl.transaction`
        import Profile from 0xProfile

        transaction {
          // We want the account's address for later so we can verify if the account was initialized properly
          let address: Address

          prepare(account: AuthAccount) {
            // save the address for the post check
            self.address = account.address

            // Only initialize the account if it hasn't already been initialized
            if (!Profile.check(self.address)) {
              // This creates and stores the profile in the user's account
              account.save(<- Profile.new(), to: Profile.privatePath)

              // This creates the public capability that lets applications read the profile's info
              account.link<&Profile.Base{Profile.Public}>(Profile.publicPath, target: Profile.privatePath)
            }
          }

          // verify that the account has been initialized
          post {
            Profile.check(self.address): "Account was not initialized"
          }
        }
      `,
      fcl.payer(fcl.authz), // current user is responsible for paying for the transaction
      fcl.proposer(fcl.authz), // current user acting as the nonce
      fcl.authorizations([fcl.authz]), // current user will be first AuthAccount
      fcl.limit(999) // set the compute limit
    ])
    .then(fcl.decode);

  return fcl.tx(txId).onceSealed();
}
