// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.16;

import "@arbitrum/nitro-contracts/src/bridge/ISequencerInbox.sol";

/// @notice Upgrade keyset accepted by the Arbitrum Nova Sequencer Inbox
contract AddNovaKeysetAction {
    ISequencerInbox public constant novaInbox =
        ISequencerInbox(address(0x211E1c4c7f1bF5351Ac850Ed10FD68CFfCF6c21b));

    // new keyset info generated offchain
    // this removes the Reddit key and secondary OCL key
    bytes32 public constant keysetHash =
        0x01191accc7ad5a8020e6c6d122984540e9fc48d0457bda63e0a32c8c31994f4a;
    bytes public constant keysetBytes =
        "0x0000000000000002000000000000000601216006dcb5e56764bb72e6a45e6deb301ca85d8c4315c1da2efa29927f2ac8fb25571ce31d2d603735fe03196f6d56bcbf9a1999a89a74d5369822c4445d676c15ed52e5008daa775dc9a839c99ff963a19946ac740579874dac4f639907ae1bc69f0c6694955b524d718ca445831c5375393773401f33725a79661379dddabd5fff28619dc070befd9ed73d699e5c236c1a163be58ba81002b6130709bc064af5d7ba947130b72056bf17263800f1a3ab2269c6a510ef8e7412fd56d1ef1b916a1306e3b1d9c82c099371bd9861582acaada3a16e9dfee5d0ebce61096598a82f112d0a935e8cab5c48d82e3104b0c7ba79157dad1a019a3e7f6ad077b8e6308b116fec0f58239622463c3631fa01e2b4272409215b8009422c16715dbede59090601216006ce839de4d6a3ae02f25b4089531e6a3d2de556bd006bd30cf2d3408b977d18f1756dd4a1bc3c00db9002f0d8ef1af50fbaa6959decbec1cbe234cc6ef6270a03339090e0238f8ac9f8a18f44b8734c8f3b6123dd128ae48a0863b9a7f6d88302043681772c2b79f350c14bc9d7b18e578c795ca76925ce7bd2891d09aa37fe2ce1ea2ffe4c038fef22f66e28995c61090221e86a3368fb6d671aafc19001f4227f92f3671af6a60b3db1285a142f49c1f450b76feb9b1aef1a551e858e4b7302c6cf1ca7fac05b993ba375d8183f90c089fa8a3df31a443d2e0a8ef193067068fbfcca2cef234cf6d9c9b5884ef69705a71810a56651726ca3b7acdfaffdfab9b2844b4ea6872b43ff9b7da2e10a2e23a79130c3c4c70a8ad0a77eb2d51f160121600f872b898a4fd1b8ae73515f7d33cd7be1e971ce1896aabef2f8926e586c4248dc0db7fd7851402c14149dc3dc84f3830c346167c39e5323971ac340415f0a2eb054a9a8e0a5d503a2acfecebdd1df71aeeac3b38260480c699bc09934f0913e0ee5aaeabd57313285207eb89366b411286cf3f1c5e30eb7e355f55385308b91d5807284323ee89a9743c70676f4949504ced3ed41612cbfda06ad55200c1c77d3fb3700059befd64c44bc4a57cb567ec1481ee564cf6cd6cf1f2f4a2dee6db00c547c38400ab118dedae8afd5bab93b703f76a0991baa5d43fbb125194c06b5461f8c738a3c4278a3d98e5456aec0720883c0d28919537a36e2ffd5f731e742b6653557d154c164e068ef983b367ef626faaed46f4eadecbb12b7e55f23175d01216002c2ec378eb6ba17a9e81b8fd44263d699c34719492a4ecf1ee76a942bc22478fb7a9f94e2f15822630f2d616c32a3340387118e4b96e26d6e41dbaab9fe27ad608bd823a142f988f7da999cdeca08ab4afedb6b3da2d4db208cc0ba91bfd44e153bd73736b7df01341780aaa7f185fca0d3a478dfb53b612ed91f054416de7bd62c59d39b4ee604ea96cb42f3d6aa20112197b4b9acf736e47fb44cf00cbe3725227d8aea5bca1efbbb894c1cbb566a7ab1b701e81dafd5b9f3077ce4f8b2f8000a047fb88dc5dcf8afee7658df0f985333a31516fba62200760fe4256c0260b199949737fb88f77d75c35dea4349261213ee6bebbff350204aff7cd8461651bed57cb455184b90abf56a1bb23deffea9bb25daec5cd2be9d7ce010719b9d5a012160137e0965267913f9eaf85bff22e3ce5f44bb1bfaed7679b1680acd15436a84325eba7f2962ca46937ccbf46d99edc944034cdd97bc4fb1d8dc3addb9c348431a99975959e6ac8238376af31f03e754fa3c315927cd6860265ec8e6e97da40a9509327773e7aa5bcfaef7690d769063336f6d5210a7de55e0ebf251ffd53f6dca022267fbc3ffc08e4709e3414a96b804056dd7e7ffc38927d8a3d8a5c0f46a8e737d638e89ef5c96fc5dfe79a21da0a2b5cbd0c1bb2e95ca9bbff1d416585c2c0119b676dc053c5abb3b0b4d60eafa065715a2c301a8d58bac871df836dfc0eb8d4ede191cab4cf6655451a37c9cf376082a65d5f23b818c185c56b16ce980b6fe0d68838fde6778fcc652cf6813fefd21db3727454df59ad3be7465d60507aa0121600478d126ce394ef52d6ffc6845672dfcedb14d4cabe76acd9efff25892b31dc32d8bd21426575f08a30b1b84bb8c1f6507810e25d47852f1f2a06b66b5341d02d7481a1cce01257e768aa1a59b683a28f6f7946674541f0f4e23643d31dfd7e90958a361c7db86b628fe075d94c85e2c43f858d3f3683d5369a87f76b3902c0765ddc8c904e375b0f5740db5d2e25f1b159a966e20596b1a38ff311b5365d7709cc679991307d692152cff49876663f315e081f4c0bc85c38a66f2198d5390170c275e23e9843ea74a046b3e7084aaa1d53c6fc6c8622250dcb812d444c341a8470df4b2c2ec3ab0d4aa563b101a31520d71df0c9c1eec4818cbaecb324ac2b9045aeb316bb1f4c6c9aac9247f1ec3fb824247f3858d1b9c6031413a11a7b059";

    function perform() public {
        // adds new keyset as valid submitter
        novaInbox.setValidKeyset(keysetBytes);

        // verify keyset was set correctly
        require(novaInbox.isValidKeysetHash(keysetHash), "valid keyset not set");

        // this action does not remove the old keyset to allow for a seemless transition on the batch poster
        // once the offchain batch poster is updated, the old keyset should be removed so the one added in this action is the sole valid one
    }
}
