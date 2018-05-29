<!--  -->
<script lang="ts" src="./symbol.debug.ts"></script>

<style>
/**/

</style>

<template>
	<section>
		<div class="container">
			<div class="columns">
				<div class="column is-12-tablet is-8-desktop is-4-widescreen">
					<b-table class="nowrap-first" narrowed :data="tabledata">
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
			</div>
		</div>
	</section>
</template>
