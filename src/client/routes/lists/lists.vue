<!--  -->
<script lang="ts" src="./lists.ts"></script>

<style>
/**/

</style>

<template>
	<section class="">

		<section v-visible="!busy" class="section" v-for="list in lists" :key="list.name">
			<div class="container">
				<p class="is-size-3 font-semibold has-text-dark mb-1">{{list.name}}</p>
				<!-- <hr class="mb-3 h-1 has-background-dar"> -->
				<b-table class="card is-middle is-nowrap is-borderless is-scroll" hoverable :data="tabledata(list.symbols)" :opened-detailed="defaultOpenedDetails"
				    detailed detail-key="symbol">
					<template slot-scope="props">
						<b-table-column label="" width="1">
							<symbol-logo class="shadow is-32x32" :symbol="props.row.symbol"></symbol-logo>
						</b-table-column>
						<b-table-column label="Symbol" width="1">
							<button class="button is-size-5 font-semibold leading-none w-full h-initial" v-on:click="gotosymbol(props.row.symbol)">
								{{props.row.symbol}}
							</button>
						</b-table-column>
						<b-table-column label="Name" class="truncate tablet:max-w-ns">
							{{props.row.tinyName}}
						</b-table-column>
						<b-table-column label="Price" class="text-lg font-semibold font-mono" numeric>
							<!-- {{vnumber(props.row.price,{precision:2})}} -->
							<number-ticker :number="props.row.price"></number-ticker>
						</b-table-column>
						<b-table-column label="Change" class="font-mono" numeric v-bull-bear="props.row.change">
							{{vnumber(props.row.change,{plusminus:true})}} ({{vnumber(props.row.percent,{plusminus:true,percent:true,precision:2})}})
						</b-table-column>
						<b-table-column label="Volume" class="font-mono" numeric>
							{{vnumber(props.row.volume,{compact:true,precision:2})}}
						</b-table-column>
						<b-table-column label="Avg Volume" class="font-mono" numeric>
							{{vnumber(props.row.avgVolume,{compact:true,precision:2})}}
						</b-table-column>
						<!-- <b-table-column label="10day Volume" class="font-mono" numeric>
							{{vnumber(props.row.avgVolume10Day,{compact:true,precision:2})}}
						</b-table-column>
						<b-table-column label="3mo Volume" class="font-mono" numeric>
							{{vnumber(props.row.avgVolume3Month,{compact:true,precision:2})}}
						</b-table-column> -->
						<b-table-column label="Market Cap" class="font-mono" numeric>
							{{vnumber(props.row.marketCap,{compact:true,precision:2})}}
						</b-table-column>
						<!-- <b-table-column label="Updated" class="" numeric>
							<span v-timestamp="props.row.timestamp"></span>
						</b-table-column> -->
					</template>

					<template slot="detail" slot-scope="props">
						<article class="media">
							<figure class="media-left">
								<p class="image is-64x64">
									<img src="static/img/placeholder-128x128.png">
								</p>
							</figure>
							<div class="media-content">
								<div class="content">
									<p>{{props.row.symbol}}</p>
								</div>
							</div>
						</article>
					</template>
				</b-table>
			</div>
		</section>

	</section>
</template>
