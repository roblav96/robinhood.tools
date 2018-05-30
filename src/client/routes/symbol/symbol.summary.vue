<!--  -->
<script lang="ts" src="./symbol.summary.ts"></script>

<style>
/**/

section.symbol-route div.bidask .progress::-webkit-progress-bar {
	background-color: white;
	border: 1px solid var(--border);
}

</style>

<template>
	<div class="container">
		<div class="columns is-desktop">



			<div class="bidask box column content text-sm">
				<div class="columns is-mobile is-gapless mb-1">
					<p class="column is-narrow">Bid</p>
					<p class="column has-text-centered">Spread</p>
					<p class="column is-narrow">Ask</p>
				</div>
				<div class="columns is-mobile is-gapless mb-0">
					<div class="column is-6">
						<progress class="progress is-danger is-small rounded-none mb-0" :value="bidask.bid.price" :min="0" :max="100"
						    style="transform: rotate(180deg);"></progress>
					</div>
					<div class="column is-6">
						<progress class="progress is-success is-small rounded-none mb-0" :value="bidask.ask.price" :min="0" :max="100"></progress>
					</div>
				</div>
				<div class="columns is-mobile is-gapless mb-1">
					<p class="column is-narrow has-text-danger">{{vnumber(all.quote.bidPrice)}}</p>
					<p class="column has-text-centered">{{vnumber(vpercent(all.quote.askPrice, all.quote.bidPrice),{percent:true})}}</p>
					<p class="column is-narrow has-text-success">{{vnumber(all.quote.askPrice)}}</p>
				</div>
				<div class="columns is-mobile is-gapless mb-0">
					<div class="column is-6">
						<progress class="progress is-success is-small rounded-none mb-0" :value="bidask.bid.size" :min="0" :max="100"
						    style="transform: rotate(180deg);"></progress>
					</div>
					<div class="column is-6">
						<progress class="progress is-danger is-small rounded-none mb-0" :value="bidask.ask.size" :min="0" :max="100"></progress>
					</div>
				</div>
				<div class="columns is-mobile is-gapless mb-0">
					<p class="column has-text-success">{{vnumber(all.quote.bidLot,{precision:0})}}</p>
					<p class="column has-text-centered"></p>
					<p class="column has-text-danger has-text-right">{{vnumber(all.quote.askLot,{precision:0})}}</p>
				</div>
			</div>



		</div>
	</div>
</template>
