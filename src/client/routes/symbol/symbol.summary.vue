<!--  -->
<script lang="ts" src="./symbol.summary.ts"></script>

<style>
/**/

</style>

<template>
	<div class="container">



		<div class="columns is-multiline is-mobile">
			<div class="column" v-for="schema in schemas" :key="schema.name">
				<table class="table is-middle is-fullwidth is-borderless card">
					<thead>
						<tr>
							<th class="whitespace-no-wrap">{{schema.name}}</th>
							<th class="py-1 has-text-right">
								<b-icon size="is-28x28" :icon="schema.icon"></b-icon>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="def in schema.defs" :key="def.key">
							<td class="whitespace-no-wrap">{{!def.title?vscase(def.key):def.title}}</td>
							<td class="has-text-right font-medium">
								{{vvalue(def.key)}}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div class="column">
				<table class="table is-middle is-fullwidth is-borderless card">
					<thead>
						<tr>
							<th class="whitespace-no-wrap">Description</th>
							<th class="py-1 has-text-right">
								<b-icon size="is-28x28" icon="book-open-variant"></b-icon>
							</th>
						</tr>
						<tr>
							<th class="font-normal border-0 content" colspan="2">
								<p>{{all.quote.description}}</p>
							</th>
						</tr>
					</thead>
				</table>
			</div>
		</div>



	</div>
</template>
