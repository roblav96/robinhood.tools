<!--  -->
<script lang="ts" src="./lists.ts"></script>

<style>
/**/

</style>

<template>
	<section class="">

		<section class="section" v-for="list in lists" :key="list.name">
			<div class="container">
				<p class="is-size-3 font-semibold">{{list.name}}</p>
				<hr class="mb-3 has-background-primary h-1">
				<b-table class="is-middle card" narrowed hoverable :data="tabledata(list.symbols)">
					<template slot-scope="props">
						<b-table-column label="" width="1" :sortable="false" class="is-clickable" v-on:click.native="gotosymbol(props.row.symbol)">
							<symbol-logo class="shadow is-32x32" :symbol="props.row.symbol"></symbol-logo>
						</b-table-column>
						<b-table-column label="Symbol" class="is-clickable" v-on:click.native="gotosymbol(props.row.symbol)">
							<p class="whitespace-no-wrap is-size-5 font-medium">{{props.row.symbol}}</p>
							<p class="is-size-7">{{props.row.name}}</p>
						</b-table-column>
						<b-table-column label="Price" class="" numeric>
							{{vnumber(props.row.price)}}
						</b-table-column>
						<b-table-column label="Change" class="" numeric v-bull-bear="props.row.change">
							<span>{{vnumber(props.row.change,{plusminus:true})}}</span>
							<span>({{vnumber(props.row.changeRatio*100,{plusminus:true,percent:true,precision:2})}})</span>
						</b-table-column>
						<b-table-column label="Volume" class="" numeric>
							{{vnumber(props.row.volume,{compact:true,precision:2})}}
						</b-table-column>
						<b-table-column label="10day Volume" class="" numeric>
							{{vnumber(props.row.avgVol10D,{compact:true,precision:2})}}
						</b-table-column>
						<b-table-column label="3mo Volume" class="" numeric>
							{{vnumber(props.row.avgVol3M,{compact:true,precision:2})}}
						</b-table-column>
					</template>
				</b-table>
			</div>
		</section>

	</section>
</template>
