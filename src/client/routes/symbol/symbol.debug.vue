<!--  -->
<script lang="ts" src="./symbol.debug.ts"></script>

<style>
/**/

</style>

<template>
	<div class="container">

		<div class="columns is-multiline is-mobile">
			<div class="column" v-for="allkey in allkeys" :key="allkey">
				<table class="table is-middle is-fullwidth card">
					<thead>
						<tr>
							<th colspan="2" class="is-size-3 font-bold">{{allkey}}</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="row in tabledata(allkey)" :key="row.key">
							<td class="has-text-left">{{vrowkey(row.key)}}</td>
							<td class="has-text-right font-medium">{{vrowvalue(row.value, row.key)}}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- <b-tabs expanded v-model="tabindex">
			<b-tab-item :label="key" v-for="key in keys" :key="key">
				<b-table class="nowrap-first" narrowed :data="tabledata(key)">
					<template slot-scope="props" slot="header"></template>
					<template slot-scope="props">
						<b-table-column label="Property" field="k" class="">
							{{rowkey(props.row.k)}}
						</b-table-column>
						<b-table-column numeric label="Value" field="v" class="font-medium" :class="{'font-mono':Number.isFinite(props.row.v)}">
							{{rowvalue(props.row.v)}}
						</b-table-column>
					</template>
				</b-table>
			</b-tab-item>
		</b-tabs> -->

		<!-- <div class="columns">
				<div class="column is-6-desktop is-4-widescreen">
					<b-table class="nowrap-first" narrowed :data="tabledata" v-for="tables">
						<template slot-scope="props" slot="header"></template>
						<template slot-scope="props">
							<b-table-column label="Property" field="key" class="">
								{{rowkey(props.row.key)}}
							</b-table-column>
							<b-table-column numeric label="Value" field="value" class="font-medium" :class="{'font-mono':Number.isFinite(props.row.value)}">
								{{rowvalue(props.row.value)}}
							</b-table-column>
						</template>
					</b-table>
				</div>
			</div> -->
	</div>
</template>
