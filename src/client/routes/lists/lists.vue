<!--  -->
<script lang="ts" src="./lists.ts"></script>

<style>
/**/

</style>

<template>
	<!-- <section v-visible="lists.length>0&&quotes.length>0" class="pb-12"> -->
	<section class="pb-12">

		<section class="section" v-for="list in lists" :key="list.name">
			<div class="container">
				<p class="is-size-3 font-semibold">{{list.name}}</p>
				<hr class="mb-3 has-background-primary h-1">
				<b-table class="is-middle card is-nowrap" narrowed hoverable :data="tabledata(list.symbols)" :opened-detailed="defaultOpenedDetails"
				    detailed detail-key="symbol">
					<template slot-scope="props">
						<b-table-column label="" width="1" class="is-clickable" v-on:click.native="gotosymbol(props.row.symbol)">
							<symbol-logo class="shadow is-32x32" :symbol="props.row.symbol"></symbol-logo>
						</b-table-column>
						<b-table-column label="Symbol" width="1">
							<!-- <span class="font-semibold">{{props.row.symbol}}</span> -->
							<button class="button font-semibold leading-none h-initial" v-on:click="gotosymbol(props.row.symbol)">
								{{props.row.symbol}}
							</button>
						</b-table-column>
						<b-table-column label="Name" class="truncate max-w-ns">
							{{props.row.tinyName}}
						</b-table-column>
						<b-table-column label="Price" class="font-mono" numeric>
							{{vnumber(props.row.price,{precision:2})}}
						</b-table-column>
						<b-table-column label="Change" class="font-mono" numeric v-bull-bear="props.row.change">
							{{vnumber(props.row.change,{plusminus:true})}}
							<span v-visible="Number.isFinite(props.row.percent)">({{vnumber(props.row.percent,{plusminus:true,percent:true,precision:2})}})</span>
						</b-table-column>
						<b-table-column label="Volume" class="font-mono" numeric>
							{{vnumber(props.row.volume,{compact:true,precision:2})}}
						</b-table-column>
						<b-table-column label="10day Volume" class="font-mono" numeric>
							{{vnumber(props.row.avgVolume10Day,{compact:true,precision:2})}}
						</b-table-column>
						<b-table-column label="3mo Volume" class="font-mono" numeric>
							{{vnumber(props.row.avgVolume3Month,{compact:true,precision:2})}}
						</b-table-column>
						<b-table-column label="Market Cap" class="font-mono" numeric>
							{{vnumber(props.row.marketCap,{compact:true,precision:2})}}
						</b-table-column>
						<b-table-column label="Updated" class="" numeric>
							<span v-timestamp="props.row.timestamp"></span>
						</b-table-column>
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
