<!--  -->
<script lang="ts" src="./accounts.ts"></script>

<style>
/**/

.table-nowrap-first tr > td:first-child {
	white-space: nowrap;
}

</style>

<template>
	<section class="accounts-route">

		<section class="hero is-small is-primary is-bold">
			<div class="hero-body">
				<div class="container">
					<h1 class="title">Accounts</h1>
				</div>
			</div>
			<div class="hero-foot">
				<nav class="tabs is-boxed is-medium">
					<div class="container">
						<ul>
							<li :class="{ 'is-active': tabindex == i }" v-on:click="tabindex = i" v-for="(v,i) in accounts">
								<a>
									<b-icon icon="bank"></b-icon>
									<span>{{v.account_number}}</span>
								</a>
							</li>
						</ul>
					</div>
				</nav>
			</div>
		</section>

		<div class="container">
			<b-table class="table-nowrap-first" :data="daccount">
				<template slot-scope="props">
					<b-table-column class="font-medium" width="1" field="k" label="Key">{{ props.row.k }}</b-table-column>
					<b-table-column field="v" label="Value">{{ props.row.v }}</b-table-column>
				</template>
			</b-table>
			<b-table class="table-nowrap-first" :data="dmargin">
				<template slot-scope="props">
					<b-table-column class="font-medium" width="1" field="k" label="Key">{{ props.row.k }}</b-table-column>
					<b-table-column field="v" label="Value">{{ props.row.v }}</b-table-column>
				</template>
			</b-table>
			<b-table class="table-nowrap-first" :data="dinstant">
				<template slot-scope="props">
					<b-table-column class="font-medium" width="1" field="k" label="Key">{{ props.row.k }}</b-table-column>
					<b-table-column field="v" label="Value">{{ props.row.v }}</b-table-column>
				</template>
			</b-table>
		</div>

	</section>
</template>
