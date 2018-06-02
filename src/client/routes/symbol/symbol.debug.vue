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
	</div>
</template>
