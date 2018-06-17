<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style>
/**/

</style>

<template>
	<div id="symbol_route" class="flex-col has-background-white-ter">

		<section class="section has-background-white">
			<div class="columns items-center whitespace-no-wrap">

				<div class="column is-narrow">
					<div class="columns is-mobile items-center">
						<div class="column is-narrow">
							<v-symbol-logo class="is-56x56 shadow" :symbol="symbol"></v-symbol-logo>
						</div>
						<div class="column">
							<span class="title">{{symbol}}</span>
							/ {{all.quote.acronym}}
							<br> {{vname(all.quote.name)}}
							<!-- <br> {{all.quote.tinyName||all.quote.name}} -->
						</div>
						<!-- <div class="column">
							{{all.quote.sector}}
							<br> {{all.quote.industry}}
						</div> -->
					</div>
				</div>

				<div class="column is-narrow">
					<div class="columns is-mobile text-center">
						<div class="column">
							<v-price-ticker class="title" :price="all.quote.price"></v-price-ticker>
							<br>
							<v-timestamp :value="all.quote.timestamp" :opts="{verbose:true}"></v-timestamp>
						</div>
						<div class="column">
							<span class="title" v-bull-bear="all.quote.percent">
								{{vnumber(all.quote.percent,{plusminus:true,percent:true})}}
							</span>
							<br>
							<span v-bull-bear="all.quote.change">
								{{vnumber(all.quote.change,{plusminus:true})}}
							</span>
						</div>
					</div>
				</div>



			</div>
		</section>

		<v-symbol-chart :symbol="symbol" :quote="all.quote"></v-symbol-chart>

	</div>
</template>
