<!--  -->
<script lang="ts" src="./symbol.ticker.ts"></script>

<style>
/**/

</style>

<template>
	<section class="section">
		<div class="container">



			<!-- <p class="is-size-3 font-semibold mb-4 text-center">Session Prices</p> -->
			<div class="columns is-multiline is-mobile">
				<div class="column" v-for="state in states" :key="state.name">
					<table class="table is-middle is-fullwidth is-nowrap is-borderless card">
						<thead>
							<tr>
								<th class="whitespace-no-wrap">{{state.name}}</th>
								<th class="py-1 has-text-right">
									<b-icon size="is-24x24" :icon="state.icon"></b-icon>
								</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<b-tooltip :label="state.tip" position="is-top" size="is-small" multilined>
									<td>{{vstcase(state.calc)}}</td>
								</b-tooltip>
								<td class="has-text-right font-medium font-mono">
									{{vnumber(all.quote[state.calc])}}
								</td>
							</tr>
							<tr>
								<td>{{vstcase(`${state.key}Price`)}}</td>
								<td class="has-text-right font-medium font-mono">
									{{vnumber(all.quote[vcamel(`${state.key}Price`)])}}
								</td>
							</tr>
							<tr>
								<td>{{vstcase(`${state.key}Change`)}}</td>
								<td class="has-text-right font-medium font-mono" v-bull-bear="all.quote[vcamel(`${state.key}Change`)]">
									{{vnumber(all.quote[vcamel(`${state.key}Change`)],{nozeros:true,plusminus:true})}}
								</td>
							</tr>
							<tr>
								<td>{{vstcase(`${state.key}Percent`)}}</td>
								<td class="has-text-right font-medium font-mono" v-bull-bear="all.quote[vcamel(`${state.key}Percent`)]">
									{{vnumber(all.quote[vcamel(`${state.key}Percent`)],{nozeros:true,plusminus:true,percent:true})}}
								</td>
							</tr>
							<tr>
								<td>Updated</td>
								<td class="has-text-right font-medium">
									<v-timestamp :value="all.quote[vcamel(`${state.key}Timestamp`)]"></v-timestamp>
									<!-- {{vtime(all.quote[vcamel(`${state.key}Timestamp`)],{max:1})}} -->
								</td>
							</tr>
						</tbody>
					</table>
				</div>


				<!-- <div class="columns is-mobile is-gapless mb-1">
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
							</div> -->

			</div>
		</div>
	</section>
</template>
