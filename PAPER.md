# Retrieval Assurance Protocol (Retriev.org)

Last update: 7th Dec 2022


## Short Intro 

 
:globe_with_meridians: **Context**: We consider the setting of a decentralized storage network. That is, we have clients who delegate the storage of their file to a network of storage providers. 

:bomb: **Problem**: We focus on the problem of having a  "retrievability assurance" for such storage service. Specifically, the key question we looked at is: how can clients delegating storage be confident that the data can be retrieved from the network (ie, the guaranteed retrieval problem)?

:dart: **Goal**:  We believe that to answer this  question we need a protocol that makes not answering retrieval requests irrational (ie, not profitable). More at the high level, we want a system of penalties (and eventually incentives) that push providers who promised a retrieval service to fulfill this commitment.


📌 **Protocol Overview**:  We designed the protocol in this way:
1. We have a consortium of providers that sign up to participate in our system; 
1. We have a fixed set of referees for which we can say that half of them are honest (eg, 5 referees and we trust 3 of them);
2. Client and provider agree on a *retrievability deal* (aka the assurance policy for the retrieval service); providers lock down a collateral for each deal;
3. When a client does not get the requested file, it appeals to the referees. One of them tries to retrieve the file asking it again to the provider, if this works the file is forwarded to the client; If not, we try again. After some failed attempts, the provider is penalized: the collateral is taken away.

In the following section we describe this idea in full details. 


#### Links
- Website: retriev.org
- GitHub Repo: https://github.com/protocol/retriev
- Slack: https://filecoinproject.slack.com/archives/C03CJKWP2DR




## Protocol Description


### Parties:

- **Clients**: A client is the user of our protocol, it has data stored on a storage network (ie, Filecoin or IPFS) and wants to get an assurance on the fact that retrieval requests will be successful. To do so, the client can propose a *retrievability deal* to the providers in the protocol. At the high level, with this kind of deal the client pays a provider to lock down a collateral that be "slashed" (ie, taken from the providers) if the provider misbehave (more details on the deal syntax in the next section).

- **Providers**: In our protocol, a provider is the party in charge of the retrieval service (ie, the client asks for a file, the provider serves it). When a provider accepts a retrievability deal, it locks down a collateral as guarantee of the retrieval service. This means that if a retrieval request is not fulfilled later on, the collateral will be taken from the provider ("the providers is slashed").  In the current implementation the list of providers participating in the protocol is  part of the smart contract. In particular, this list is created and updated by the contract’s owners and a party that wants to act as provider in our protocol needs to communicate its intention to join to the owners. This can be done by filling the sign-up form available in the dapp.
    - Each provider has a *deal policy* that states:
        -  the `min_price`:  minimum price per second per byte, 
        -  the `max_rate`:  maximum rate (collateral/payment) 
        - the `max_size`: maximum file size accepted in a proposal  
        - `max_duration`
    - The default values are `min_price`= 0,  `max_rate` = `slashing_multiplier` (here `slashing_multiplier` is a protocol parameter, see "protocol parameters" section), and `max_size`= 20MB.


- **Referees**: The referees are the core of our protocol, their role is to manage appeals from clients, to request file from providers and serve to clients, and eventually to agree on slashing a provider. The set of the referees has size $n$ (protocol parameter) and is chosen once for each instance of the protocol. In the current implementation, the list of referees is a part of the smart contract.


- **Smart Contract** and **Blockchain**: the smart contract contains the logic to create the deals, create and process appeals and slash providers.

### Retrievability Deal:


#### Create deal proposal

`createDealProposal(string data_uri) -> uint256 deal_id`

A client creates a  deal proposal  specifying: 
- The identifier of the file (or folder of files) that is the subject of the deal, `data_uri`;
- The  list of providers that can accept it;
- The list of addresses that can later on send the "create appeal" transactions (after the proposal is accepted);
- The `payment`: amount (in native tokens) paid by the client to the provider if the deal is not invalidated by an appeal (ie, deal ends with no slashing); at the moment of the proposal creation, the `payment` is "locked down" (ie, taken from the client's account and deposited to the smart contract); ~~the proposal is valid only if `payment > 0`;~~
- The `duration`: for how long the deal is active, starting from when it is accepted (expressed in seconds); the proposal is valid only if `duration` is in a range specified by the smart contract code (see "protocol parameters" section). 
- The `collateral`: amount (in native tokens) required to be locked down from the provider account to accept the deal. 


Comment: In the current Client UI we designed two modes:
- *Default mode*:  the UI sets the values for payment and collateral. In particular, for both the suggested value is `min_price * file_size * duration`. Then, the client can increase the two values as long as the following conditions are satisfied:
  - `payment` ≤ `collateral`
  - `collateral` ≤ `max_rate` * `payment`.
- *Expert mode*: the UI allows the client to choose any value for the payment and the collateral.

#### Cancel Deal Proposal

A client can cancel a proposal (not accepted yet) at any time, and this action will release the `payment`


Moreover, a deal proposal has a timeout (currently set to 86400 seconds) after which it can not be accepted by providers anymore. 

#### Accept deal proposal
`acceptDealProposal(uint256 deal_id, string data_uri)`



A provider can accept a deal proposal if all the following is true:
- It is one of the providers for which the proposal was issued;
- The proposal is active (no timeout, no cancel message);
- It has enough balance in his internal account in order to cover for the `collateral`. 

When the proposal is accepted, the `collateral` is "locked down" (ie, from the provider's account deposited to the smart contract). Also, we timestamp this on-chain, and we consider the deal active from this moment (`timestamp_start`).

Comment: we designed the provider CLI in such a way then before automatically accepting a proposal, the followinf conditions are checked:
- the file can be retrieved, it is of size `file_size` and `file_size` <= `max_size`;
- the payment value is larger or equal to `min_price * file_size * duration`;
- the collateral value is smaller of equal to `max_rate * payment`.


#### Creat an "express" deal (ie, deal without proposal)


`createDeal( address owner, string data_uri, uint256 duration, array[] appeal_addresses ) -> uint256 deal_id`

A provider can create a deal by specifying:

- The identifier of the file (or folder of files) that is the subject of the deal, `data_uri`;
- The parameter `owner` to this function so provider can assign deal to a client
- The list of addresses that can later on send the “create appeal” transactions;
- The duration: for how long the deal is active, starting from when it is created (expressed in seconds); the deal is valid only if duration is in a range specified by the smart contract code (see “protocol parameters” section).
- The collateral (msg.value as input parameter): amount (in native tokens) that is “locked down” (ie, from the provider’s account deposited to the smart contract). Also, we timestamp this on-chain, and we consider the deal active from this moment (timestamp_start).


#### Redeem deal
`redeemDeal(uint256 deal_index)`
After a deal ends, if the provider was not slashed, then he can ask to get the `payment` (ie  from the smart contract vault, deposited to provider's account).



### Appeal:

#### Create appeal
While the deal is active, the client can appeal to the referees at any instant on time for requesting the assured storage. To do so, one of the appeal addresses specified in the deal creates an appeal  and the appeal is considered valid if all the following is true:
- The deal is active (accepted by the provider and the on-chain appeal message timestamp is between `timestamp_start` and `deal_duration` + `timestamp_start`); 
- For this deal, the number of appeals already created is less the the maximum allowed by the protocol (see `max_appeals` in the "protocol parameters" section);
- There is no already an appeal active;
- It includes the payment of the `appeal_fee`. This is the amount of token that the client pays to the referees for their service. Currently
    - `appeal_fee = committee_multiplier` * `payment` 
    - the contract splits the fee in $n$ equal parts and deposits a part in each referee's account.

The moment the appeal is created on chain defines the `request_timestamp`.

    
#### Start and Process appeal
If an appeal is created, any referee that is free can start the appeal process. 
The moment the process is started on chain defines the `origin_timestamp`.

The protocol to process an appeal is made by $k$ rounds each one of duration `round_duration` (currently set to 300 seconds). In each rounds the referees try to retrieve the file in this way:
    
- Step 1: a retrieval leader is chosen at random. For example
    - Compute the hash of `(deal_id + appeal_id + round_number)`;
    - Interpret the hash output as an integer modulo $n$;
- Step 2: the leader asks the file to the provider.
    - Step 2.a:  If the leader does not get the correct file within `leader_waiting` time from when the round started, sends a “failure msg” on chain; the other referees see the message and do nothing for the remaining time of this round; in the next round all starts from Step 1;
        - Note that, when a referee creates a “failure msg”, it needs to sign `(deal_id +  appeal_id + round_number + 0)`;
        - Currently we set`leader_waiting = 1/2 * round_duration`; 
    - Step 2.b: If the leader gets the file it forwards it to the client and to the other referees. Each referee does the following:
        - If the correct file is received, forward it to the client;
        - If the correct file is not received before the end of the round, sign a "failure vote" and broadcast it to the other referees;
        - Count the number of  failure votes received, if they are $≥ n/2$, then send a “failure msg” on chain; at the next round, start from Step 1. Otherwise, do nothing for the remaining rounds. Note that only the first "failure msg" goes through. 
        
After the $k$ rounds are over, the contract checks the total number of “failure messages”.
- If it is greater or equal to `slashes_threshold`, then the provider is  "slashed" (ie, the  `collateral` is deposited to the contract owner's account), the `payment` is returned to the client and the deal is deactivated. Currently, we have `slashes_threshold` = $k$.
- Otherwise  nothing happen (in particular, the deal stays active).



#### List of events in the smart contract:
1.    `DealProposalCreated(uint256 index, address[] providers, string data_uri)`: Event emitted when new deal proposal is created by the client;
2.  `DealProposalAccepted(uint256 index)`: Event emitted when a deal proposal is accepted by a provider (defines `timestamp_start`);
3.  `DealProposalCanceled(uint256 index)`: Event emitted when a deal proposal is canceled by the client before being accepted;
4. `AppealCreated(uint256 index, address provider, string data_uri)`: Event emitted when new appeal is created by the client (defines `request_timestamp`);
5. `AppealStarted(uint256 index, address provider, string data_uri)`: Event emitted when an appeal process is started by a referee (defines `origin_timestamp`);
6. `RoundSlashed(uint256 index)`: Event emitted when a failure message is recorded during the process of an appeal; 
7. `DealInvalidated(uint256 index)`: Event emitted when a deal is invalidated (ie the appeal process terminates with failure messages in each rounds);
8. `DealRedeemed(uint256 index)`: Event emitted when a deal is redeemed by the provider (needed to get the `payment`).
    

## Protocol Parameters

- $m_c$ (committee multiplier):  the amount (in native tokens) `appeal_fee` = $m_c$ `x payment` is paid to the referees each time that an appeal is made; current value: 0.2.
    - Why we need this? To prevent malicious users abusing the protocol. For example, a malicious client can create an appeal for honest provider making the provider working twice. Thanks the committee multiplier, this strategy has a cost that makes it irrational.
    -  Comment: for now we assume that the fee is equally split among all referees, for the future we can investigate about giving an higher share to referee recovering the file.
    - In the code we implement this using the variable `committee_divider = 5` and `appeal_fee = payment / committee_divider`.     
- $m_s$ (`slashing_multiplier`): the amount (in native tokens)  `slashing_multiplier x payment` is the maximum of the collateral that a client can ask for; current value: 1000.    
- `max_appeals`: maximum number of appeals per deal; current value is set to 5;
- $k$ (`rounds_limit`): number of rounds in the trial protocol; current value is set to 12.
- $n$: number of referees; current value is set to 3.
- `proposal_timeout`: timeout to accept a deal proposal (1 week), set to 86400 seconds (1 week). 
- `min_duration`: minimum duration of a deal (in seconds), set to  3600 seconds (1 h);
- `max_duration`: maximum duration of a deal (in seconds), set to  43200 seconds (12 h);        
- `round_duration`: duration of a round of the appeal trial in seconds;
- `slashes_threshold`: minimum number of "failure messages" required to slash a provider;
        
        
  
    
## Security analysis


**Assumptions**: 
1. The n referees are all always on line;
2. $h$ out of $n$ referees are honest (ie follow the protocol instructions).
  
     
    
#### Security against a malicious client:

We need to show that a even when the client acts maliciously and colludes with $n-h$ referees, an honest provider (who sends the file to referees) is not slashed (with overwhelming probability). 





Note that if there is at least 1 round where the leader is among the honest referees, then the retrieval is successful and the there is no "failure msg" on chain (ie, indeed if **h > n/2**, then $n-h < n/2$ and there is no enough dishonest referees to sig the failure massage in step 2). The probability of "at least 1 round where the leader honest" is:
- $P$= 1 - Pr(all $k$ leaders are malicious) = $1-(\frac{n-h}{n})^k$.
 
 
With $h> n/2$, we have $P \geq 1 - (1/2)^k$. If $k =12$, then $P\geq 0.999$.



Comment: a malicious user sending the appeal request  makes the honest provider works twice. However this costs the `appeal_fee` to the user, making this strategy irrational.


#### Security against a malicious provider:
We need to show that a provider that does not send the file during the appeal trial will get slashed even if $n-h$ referees are colluding with him.
At each round, we have two cases:
1. The leader is not among the colluding referees. Then in this round we collect a "failure msg", sent by the leader;
2. The leader is among the colluding referees. Then the leader does no produce any "failure msg". In this case the other referees (non-leader in this round) get "activated", and each of the h honest ones will broadcast the "failure vote". Since **h>n/2**, this implies that in total there will be at least $n/2$ votes and this round will produce "failure msg". Since, we have a "failure msg" at each round, at the end of the trial we have at least $k$ = `slashes_threshold` messages and the provider is slashed.

## Cryptoecon analysis
:::info
This section is ready to read :) 
:::


An investigation was done for informing the rational ranges of the protocol parameters as well as the soundness of the protocol dynamics as informed by an Bayesian representation and simulations based on the Deal Journey Process Diagram (fig 2). The main result was the definition of recommended ranges and values for the `slashing_multiplier`, `committee_multiplier` and `max_appeals` protocol parameters, which are as follows:

- `committee_multiplier` is rationally upper bounded by the client belief on the retrieval utility. In practice, this boundary can be indeterminally large, and therefore an best gauge for decisions should be the UX, as fostering demand for the protocol is an consideration. **We recommend therefore an value of $m_c=0.2$ with an acceptable region being between 0.1 and 1.0**
- `slashing_multiplier` is upper bounded by the provider belief on his change og being slashed and there's no trivial lower bound. The rational upper boundary is estimated to be between 1000 and 5000. Given that this parameter is a ceiling on the retrievability proposal, we suggest setting it close to the boundary. **We recommend therefore an value of $m_s=1000$, with an acceptable range being between 100 and 2000**
- `max_appeals` will affect both client and provider expectations. Specifically, it can increase the probability of the provider being slashed and the client for getting back his payment. In that sense, `max_appeals` is an slack parameter that allow us to compense the fact that the `committe_multiplier` is way lower than what would be rational. **We recommend setting-up to between 5, with an acceptable range being between 3 and 10**

![Process Diagram for the Assured Deal Journey on the Retrievability Consortium](https://hackmd.io/_uploads/ByShqqyqc.png)

*Fig 2. Process Diagram for the Assured Deal Journey on the Retrievability Consortium*

### Formalizing agent decision making on the RCP

The process on which those conclusions were generated involved an variety of theoretical, computational and SME considerations. The point of departure is through formalizing Fig 2. through an set of equations describing each actor payoffs when engaging on their actions. Namely:

- $d_1$: Client Decides to Send Proposal
     - $\pi_{d_1, \zeta}^C = \pi_r^C P(r|d_2) + p\cdot P(d_2|\zeta, d_1, I) \cdot [2 P(d_4|d_2, I) - \langle N_a\rangle m_c - 1)]-\pi_{\bar{d_2}, \zeta}^C P(\bar{d_2}|\zeta, d_1, I)$
    - $\pi_{\bar{d_1}, \zeta}^C = \pi_r^C P(r | \bar{d_2})$
- $d_2$: Provider Decides to Accept Proposal
    - $\pi_{d_2, \zeta}^P = p [P(\bar{d_4}|d_2, I) - m_s P(d_4|d_2, I)]$
    - $\pi_{\bar{d_2}, \zeta}^P = 0$
- $d_3$: Client Decides to Appeal
    - $\pi_{d_3}^C=\pi_r^C P(r|d_3, I) + p P(d_4 | d_3, I)  - p m_c$
    - $\pi_{\bar{d_3}}^C=\pi_r^C P(r | \bar{d_3})$
- $d_4$: Referees Decides to Slash
    - $\pi_{d_4}^R= \delta_sP(\bar{r}|d_3)$
    - $\pi_{\bar{d_4}}^R= \delta_\bar{s} P(r|d_3)$

On the above formalism, we have the following terminology:

- $d_i \in \{0, 1\}$: Decision $i$ being taken (0 if false, 1 if true).
- $r \in \{0, 1\}$: Data being retrieved sucessfully by the end of the assurance deal (0 if false, 1 if true).
- $\bar{e}$: Complement of event $e$ (1 if $e=0$, 0 if $e=1$)
- $\pi^A_{B} \in \mathbb{R}$: Payoff to Agent A for decision B
    - Agents are being defined as $C$: Client, $P$: Provider, $R$: Referee.
- $\zeta \in{R^3} = (p, m_s, t_d)$: Deal proposal containing the following variables
    - $p \in \mathbb{R}_+$: Deal payment
    - $m_s \in \mathbb{R}_+$: Effective Slashing Multiplier
        - Defined by being $m_s=\frac{p}{C}$, where $C \le p m_s^*$ is the collateral associated with the deal. $m_s^*$ is the protocol slashing multiplier.
    - $t_d$: deal duration.
- $\delta_s$: Referee Utility on slashing an non-retrievable deal.
- $\delta_\bar{s}$: Referee utility on not slashing an retrievable deal.
- $m_c$: Committe fee.
- $N_a$: Number of appeals during the deal.

The following parametric assumptions were made:

- Unbiased Referees: $\delta_\bar{s} = \delta_s$. Eg, the referees are not biased towards slashing or not slashing.
- Best Response Criteria: $P(d_i) = \pi^A_{d_i} > \pi^A_{\bar{d_i}}$. Eg, the decision will always be the one that maximizes pay-offs.

Also, when building the formalism, there are the following modelling assumptions:
- There's no associated costs to the provider depositing collaterals beyond the potential slash risk. Eg, opportunity costs are not taking into consideration.
- Time value of money was not taken into consideration. Eg, all decisions can be understood as being immediate.


From the above pay-offs, an series of derivations can be retrieved, mainly:
- For a fixed effective slashing multiplier. the payment value is unimportant for the provider to accept an proposal.
- There is an equilibrium value for the provider to accept proposals which is expressed as $m_s=\frac{1}{P(d_4)} - 1$. If the provider is honest and he has an 0.1% chance of being slashed, then $m_s\lt999$ in order for him to be rational to take the deal.
- If we assume that $\pi^C_r = \frac{p}{\alpha}$ and $P(d_2|d_1)=1$, where $\alpha$ is understood as an "assurance leverage" (when it is lower than 1, then client is under-insuring his actual payoff of retrieving the file), an list of consequences can be retrieved from $d_1$ when taking into consideration the rationality equilibrum value of $m_c$ in order to $d_1$ to be rational:
    - The more the number of expected appeals, the lesser $m_c$ should be.
    - The higher the prior chance of the provider getting slashed, the higher $m_c$ should be.
    - The higher the marginal retrieval probability is, the higher $m_c$ should be.
    - The higher the leveraging, the lesser $m_c$ should be.


In pratice, this means that deciding $m_s$ is dependent on the incidence of honest providers getting slashed AND it's effect on the marginal retrievability. Given [SME priors and an Bayesian simulation](https://github.com/BlockScience/filecoin-drc-research/blob/main/notebooks/decision_tree.ipynb), we believe that the equilibrium $m_s$ is between 1000 and 5000. 

As for $m_c$, it is coupled to the expected number of appeals. By introducing an ceiling on the max numbers, we can cut the long tail of the distribution and make the calculation easier. However it does have also an dependency on the leveraging, which we expect to be on the order of $0.1$. With all of those together, we would expect to have an $m_c$ which can be quite large (on the order of 10). However, when taking the marginal retrieval probability and prior slash probability into consideration, the calculation becomes highly uncertain and with little actionable insight.

Therefore, we decide to use an UX consideration for deciding $m_c$. Any value above 1 is going to be weird for the clients, as it means that they need to pay more to appeal than to have the assurance itself. This is also a point of departure from using agent rationality for parametric choice, as we now must make use of an global utility consideration: it is an design desirable that usage of the protocol is maximized.

The risk associated with low $m_c$ is about appeal spamming, which will interefere with the provider calculations. This is mitigated by having an max amount of appeals which one can do. Therefore, we recommend setting it up with an low value, like `max_appeals=5`.

### Making explicit the global utility

In order to make explict the argument on $m_c$, we argue that we're also interested in maximizing $\pi_g$, which represents the design objectives of the protocol. They are:


- Adoption of the protocol
    - $\pi^g \propto P(d_2|d_1) + P(d_1)$
- Retrievability when taking a deal
    - $\pi^g \propto \frac{P(r|d_2)}{P(r|\bar{d_2})}$
- Cost mitigating when data is not retrievable on a deal
    - $\pi^g \propto \frac{p P(\bar{r}, d_4|d_2)}{\pi_r^C}$
- Referee fairness
    - $\pi_g \propto P(d_4|\bar{r})-P(d_4|r)$ 
- Taking all together, the global utility is defined as:
    - $\pi^g = \beta_0 P(d_2|d_1) + \beta_1 P(d_1) + \beta_2 \frac{P(r|d_2)}{P(r|\bar{d_2})} + \beta_3 \frac{p P(\bar{r}, d_4|d_2)}{\pi_r^C} + \beta_4 P(d_4|\bar{r})- \beta_5 P(d_4|r)$
        - Where $\beta_i$ are relative importance weights. 
